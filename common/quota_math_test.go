package common

import (
	"math"
	"testing"

	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 2000 quota per call * n=18446744073686646784 overflows int64; the constant
// below reproduces that oversized product for the saturation checks.
const overflowingProduct = 2000 * 1.8446744073686647e19

// TestQuotaFromFloat guards the billing invariant that oversized quota
// products (e.g. price multiplied by a huge user-supplied count) saturate
// instead of wrapping into a negative charge (credit). QuotaFromFloat
// truncates toward zero.
func TestQuotaFromFloat(t *testing.T) {
	assert.Equal(t, 42, QuotaFromFloat(42.4))
	assert.Equal(t, 42, QuotaFromFloat(42.9))
	assert.Equal(t, -42, QuotaFromFloat(-42.9))
	assert.Equal(t, MaxQuota, QuotaFromFloat(overflowingProduct))
	assert.Equal(t, MinQuota, QuotaFromFloat(-overflowingProduct))
	assert.Equal(t, MaxQuota, QuotaFromFloat(math.Inf(1)))
	assert.Equal(t, MinQuota, QuotaFromFloat(math.Inf(-1)))
	assert.Equal(t, 0, QuotaFromFloat(math.NaN()))
}

// TestQuotaRound checks half-away-from-zero rounding with the same
// saturation policy.
func TestQuotaRound(t *testing.T) {
	assert.Equal(t, 42, QuotaRound(41.5))
	assert.Equal(t, 43, QuotaRound(42.5))
	assert.Equal(t, -43, QuotaRound(-42.5))
	assert.Equal(t, MaxQuota, QuotaRound(overflowingProduct))
	assert.Equal(t, MinQuota, QuotaRound(-overflowingProduct))
	assert.Equal(t, 0, QuotaRound(math.NaN()))
}

// TestQuotaFromDecimal checks the decimal entry point rounds and saturates
// consistently with the float variants.
func TestQuotaFromDecimal(t *testing.T) {
	assert.Equal(t, 43, QuotaFromDecimal(decimal.NewFromFloat(42.5)))
	assert.Equal(t, 42, QuotaFromDecimal(decimal.NewFromFloat(41.7)))
	assert.Equal(t, MaxQuota, QuotaFromDecimal(decimal.NewFromInt(2000).Mul(decimal.NewFromFloat(1.8446744073686647e19))))
	assert.Equal(t, MinQuota, QuotaFromDecimal(decimal.NewFromInt(-2000).Mul(decimal.NewFromFloat(1.8446744073686647e19))))
}

// TestQuotaFromFloatChecked verifies the clamp descriptor is nil in range and
// carries the correct kind/clamped value on saturation, so billing callers can
// audit the event.
func TestQuotaFromFloatChecked(t *testing.T) {
	quota, clamp := QuotaFromFloatChecked(42.9)
	assert.Equal(t, 42, quota)
	assert.Nil(t, clamp)

	quota, clamp = QuotaFromFloatChecked(overflowingProduct)
	assert.Equal(t, MaxQuota, quota)
	if assert.NotNil(t, clamp) {
		assert.Equal(t, "QuotaFromFloat", clamp.Op)
		assert.Equal(t, QuotaClampOverflow, clamp.Kind)
		assert.Equal(t, MaxQuota, clamp.Clamped)
	}

	quota, clamp = QuotaFromFloatChecked(-overflowingProduct)
	assert.Equal(t, MinQuota, quota)
	if assert.NotNil(t, clamp) {
		assert.Equal(t, QuotaClampUnderflow, clamp.Kind)
		assert.Equal(t, MinQuota, clamp.Clamped)
	}

	quota, clamp = QuotaFromFloatChecked(math.NaN())
	assert.Equal(t, 0, quota)
	if assert.NotNil(t, clamp) {
		assert.Equal(t, QuotaClampNaN, clamp.Kind)
		assert.Equal(t, 0, clamp.Clamped)
	}
}

func TestQuotaFromFloatStrictReturnsTypedClampError(t *testing.T) {
	quota, err := QuotaFromFloatStrict(42.9)
	require.NoError(t, err)
	assert.Equal(t, 42, quota)

	quota, err = QuotaFromFloatStrict(overflowingProduct)
	assert.Zero(t, quota)
	var clamp *QuotaClamp
	require.ErrorAs(t, err, &clamp)
	assert.Equal(t, QuotaClampOverflow, clamp.Kind)
	assert.Equal(t, MaxQuota, clamp.Clamped)
	assert.ErrorContains(t, err, "QuotaFromFloat")
	assert.ErrorContains(t, err, "overflow")
	assert.ErrorContains(t, err, "original=")
	assert.ErrorContains(t, err, "clamped=2147483647")
}

// TestQuotaRoundChecked verifies the rounding entry point reports clamps the
// same way.
func TestQuotaRoundChecked(t *testing.T) {
	quota, clamp := QuotaRoundChecked(42.5)
	assert.Equal(t, 43, quota)
	assert.Nil(t, clamp)

	quota, clamp = QuotaRoundChecked(overflowingProduct)
	assert.Equal(t, MaxQuota, quota)
	if assert.NotNil(t, clamp) {
		assert.Equal(t, "QuotaRound", clamp.Op)
		assert.Equal(t, QuotaClampOverflow, clamp.Kind)
	}
}

// MaxTopUpAmount is the ceiling payment order creation enforces so a customer is never
// charged for an order settlement cannot credit. It therefore has to sit exactly on the
// boundary of the strict conversion every settlement path runs: the advertised maximum
// must convert, one unit more must not.
func TestMaxTopUpAmountSitsOnTheStrictConversionBoundary(t *testing.T) {
	original := QuotaPerUnit
	t.Cleanup(func() { QuotaPerUnit = original })

	testCases := []struct {
		name         string
		quotaPerUnit float64
		expected     int64
	}{
		{name: "default configuration", quotaPerUnit: 500000, expected: 4294},
		{name: "one thousand quota per unit", quotaPerUnit: 1000, expected: 2147483},
		{name: "one quota per unit", quotaPerUnit: 1, expected: MaxQuota - 1},
		{name: "fractional quota per unit", quotaPerUnit: 0.5, expected: 4294967292},
		{name: "one unit already exhausts the ceiling", quotaPerUnit: float64(MaxQuota), expected: 0},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			QuotaPerUnit = tc.quotaPerUnit
			maxAmount := MaxTopUpAmount()
			require.Equal(t, tc.expected, maxAmount)
			if maxAmount == 0 {
				return
			}

			perUnit := decimal.NewFromFloat(tc.quotaPerUnit)
			_, err := QuotaFromDecimalStrict(decimal.NewFromInt(maxAmount).Mul(perUnit))
			assert.NoError(t, err, "the advertised maximum must still be creditable")
			_, err = QuotaFromDecimalStrict(decimal.NewFromInt(maxAmount + 1).Mul(perUnit))
			assert.Error(t, err, "one unit above the maximum must be refused")
		})
	}
}

// A QuotaPerUnit that cannot produce a positive quota makes every order uncreditable,
// so the ceiling must refuse all of them rather than let orders collect payment.
func TestMaxTopUpAmountRefusesEveryAmountWhenQuotaPerUnitIsUnusable(t *testing.T) {
	original := QuotaPerUnit
	t.Cleanup(func() { QuotaPerUnit = original })

	for _, quotaPerUnit := range []float64{0, -500000, math.NaN(), math.Inf(1), math.Inf(-1)} {
		QuotaPerUnit = quotaPerUnit
		assert.Zero(t, MaxTopUpAmount(), "QuotaPerUnit=%v", quotaPerUnit)
	}
}

// TestQuotaFromDecimalChecked verifies the decimal entry point reports clamps.
func TestQuotaFromDecimalChecked(t *testing.T) {
	quota, clamp := QuotaFromDecimalChecked(decimal.NewFromFloat(41.7))
	assert.Equal(t, 42, quota)
	assert.Nil(t, clamp)

	quota, clamp = QuotaFromDecimalChecked(decimal.NewFromInt(2000).Mul(decimal.NewFromFloat(1.8446744073686647e19)))
	assert.Equal(t, MaxQuota, quota)
	if assert.NotNil(t, clamp) {
		assert.Equal(t, "QuotaFromDecimal", clamp.Op)
		assert.Equal(t, QuotaClampOverflow, clamp.Kind)
	}
}
