package controller

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/operation_setting"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// getMaxTopup is compared against the raw request amount, so it has to be expressed in
// the unit the client sends — the same conversion getMinTopup applies. Getting this
// wrong in tokens display mode would reject every order, since a token count is
// QuotaPerUnit times larger than the currency amount the ceiling is derived from.
func TestGetMaxTopupMatchesTheUnitTheClientSends(t *testing.T) {
	originalQuotaPerUnit := common.QuotaPerUnit
	originalDisplayType := operation_setting.GetGeneralSetting().QuotaDisplayType
	t.Cleanup(func() {
		common.QuotaPerUnit = originalQuotaPerUnit
		operation_setting.GetGeneralSetting().QuotaDisplayType = originalDisplayType
	})

	testCases := []struct {
		name         string
		quotaPerUnit float64
		displayType  string
		expected     int64
	}{
		{
			name:         "currency display uses the currency amount ceiling",
			quotaPerUnit: 500000,
			displayType:  operation_setting.QuotaDisplayTypeUSD,
			expected:     4294,
		},
		{
			name:         "tokens display scales the ceiling into token counts",
			quotaPerUnit: 500000,
			displayType:  operation_setting.QuotaDisplayTypeTokens,
			expected:     4294 * 500000,
		},
		{
			name:         "unusable quota per unit accepts nothing",
			quotaPerUnit: 0,
			displayType:  operation_setting.QuotaDisplayTypeTokens,
			expected:     0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			common.QuotaPerUnit = tc.quotaPerUnit
			operation_setting.GetGeneralSetting().QuotaDisplayType = tc.displayType
			assert.Equal(t, tc.expected, getMaxTopup())
		})
	}
}

// An order worth more quota than the int32 quota columns can hold is unrecoverable
// once it is paid: RechargeEpay converts Amount * QuotaPerUnit with
// QuotaFromDecimalStrict and refuses the result, the order stays pending, and
// ManualCompleteTopUp refuses it for the same reason. So it has to be rejected before
// the customer is handed to the payment gateway.
func TestRequestEpayRejectsAmountAboveTheQuotaCeiling(t *testing.T) {
	previousDB := model.DB
	previousRedisEnabled := common.RedisEnabled
	previousQuotaPerUnit := common.QuotaPerUnit
	previousDisplayType := operation_setting.GetGeneralSetting().QuotaDisplayType
	previousMainDatabaseType, previousLogDatabaseType := common.MainDatabaseType(), common.LogDatabaseType()

	common.RedisEnabled = false
	common.QuotaPerUnit = 500000
	operation_setting.GetGeneralSetting().QuotaDisplayType = operation_setting.QuotaDisplayTypeUSD
	common.SetDatabaseTypes(common.DatabaseTypeSQLite, common.DatabaseTypeSQLite)

	// Silent logger: the group lookup that follows the ceiling check needs the column
	// names model.InitDB installs, which a controller test does not run, so the
	// accepted request stops there. That is fine — the assertions below only cover
	// which amounts the ceiling guard lets through.
	db, err := gorm.Open(sqlite.Open("file:topup_ceiling?mode=memory&cache=shared"), &gorm.Config{
		Logger: gormlogger.Discard,
	})
	require.NoError(t, err)
	model.DB = db
	require.NoError(t, db.AutoMigrate(&model.User{}, &model.TopUp{}))
	payer := model.User{Username: "topup-ceiling-payer", Status: common.UserStatusEnabled, Group: "default"}
	require.NoError(t, db.Create(&payer).Error)

	t.Cleanup(func() {
		model.DB = previousDB
		common.RedisEnabled = previousRedisEnabled
		common.QuotaPerUnit = previousQuotaPerUnit
		operation_setting.GetGeneralSetting().QuotaDisplayType = previousDisplayType
		common.SetDatabaseTypes(previousMainDatabaseType, previousLogDatabaseType)
		if sqlDB, err := db.DB(); err == nil {
			_ = sqlDB.Close()
		}
	})

	maxTopup := getMaxTopup()
	require.Equal(t, int64(4294), maxTopup)

	requestEpay := func(amount int64) *httptest.ResponseRecorder {
		gin.SetMode(gin.TestMode)
		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		body := fmt.Sprintf(`{"amount":%d,"payment_method":"alipay"}`, amount)
		c.Request = httptest.NewRequest(http.MethodPost, "/api/user/pay", strings.NewReader(body))
		c.Request.Header.Set("Content-Type", "application/json")
		c.Set("id", payer.Id)
		RequestEpay(c)
		return recorder
	}

	rejected := requestEpay(maxTopup + 1)
	assert.Equal(t, http.StatusBadRequest, rejected.Code)
	assert.Contains(t, rejected.Body.String(), "充值数量不能大于 4294")
	var orders int64
	require.NoError(t, db.Model(&model.TopUp{}).Count(&orders).Error)
	assert.Zero(t, orders, "a rejected order must not be persisted")

	accepted := requestEpay(maxTopup)
	assert.NotEqual(t, http.StatusBadRequest, accepted.Code)
	assert.NotContains(t, accepted.Body.String(), "充值数量不能大于")
}
