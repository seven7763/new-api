package oauth

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// The bot token doubles as the OIDC client_id source, so a malformed token must
// disable the provider rather than send Telegram an empty client_id.
func TestTelegramOIDCClientID(t *testing.T) {
	original := common.TelegramBotToken
	t.Cleanup(func() { common.TelegramBotToken = original })

	cases := []struct {
		name  string
		token string
		want  string
	}{
		{"valid", "8766595669:AAExampleSecretValue", "8766595669"},
		{"whitespace padded", "  8766595669:AAExample  ", "8766595669"},
		{"empty", "", ""},
		{"no separator", "8766595669", ""},
		{"non numeric bot id", "notanid:AAExample", ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			common.TelegramBotToken = tc.token
			assert.Equal(t, tc.want, telegramOIDCClientID())
		})
	}
}

// Signature, issuer, audience and expiry must all be enforced before any claim
// is trusted — a forged or misdirected token must never yield a user.
func TestVerifyTelegramIDToken(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)

	const kid = "test-key"
	const clientID = "8766595669"

	// Seed the cache directly so the test never reaches the network.
	telegramJWKSCache.Lock()
	telegramJWKSCache.keys = map[string]any{kid: &key.PublicKey}
	telegramJWKSCache.fetchedAt = time.Now()
	telegramJWKSCache.Unlock()
	t.Cleanup(func() {
		telegramJWKSCache.Lock()
		telegramJWKSCache.keys = map[string]any{}
		telegramJWKSCache.fetchedAt = time.Time{}
		telegramJWKSCache.Unlock()
	})

	sign := func(t *testing.T, claims jwt.Claims, signingKid string) string {
		t.Helper()
		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		token.Header["kid"] = signingKid
		signed, err := token.SignedString(key)
		require.NoError(t, err)
		return signed
	}

	validClaims := func() *telegramOIDCClaims {
		return &telegramOIDCClaims{
			Subject:           "1234123412341234123",
			TelegramID:        987654321,
			Name:              "John Doe",
			PreferredUsername: "johndoe",
			RegisteredClaims: jwt.RegisteredClaims{
				Issuer:    telegramOIDCIssuer,
				Audience:  jwt.ClaimStrings{clientID},
				IssuedAt:  jwt.NewNumericDate(time.Now()),
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			},
		}
	}

	t.Run("accepts a well formed token", func(t *testing.T) {
		got, err := verifyTelegramIDToken(context.Background(), sign(t, validClaims(), kid), clientID)
		require.NoError(t, err)
		assert.Equal(t, int64(987654321), got.TelegramID)
		assert.Equal(t, "1234123412341234123", got.Subject)
		assert.Equal(t, "johndoe", got.PreferredUsername)
		assert.Equal(t, "John Doe", got.Name)
	})

	t.Run("rejects a foreign issuer", func(t *testing.T) {
		claims := validClaims()
		claims.Issuer = "https://evil.example.com"
		_, err := verifyTelegramIDToken(context.Background(), sign(t, claims, kid), clientID)
		require.Error(t, err)
	})

	t.Run("rejects a token minted for another client", func(t *testing.T) {
		claims := validClaims()
		claims.Audience = jwt.ClaimStrings{"1111111111"}
		_, err := verifyTelegramIDToken(context.Background(), sign(t, claims, kid), clientID)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "audience")
	})

	t.Run("rejects an expired token", func(t *testing.T) {
		claims := validClaims()
		claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(-time.Minute))
		_, err := verifyTelegramIDToken(context.Background(), sign(t, claims, kid), clientID)
		require.Error(t, err)
	})

	t.Run("rejects a token with no expiry", func(t *testing.T) {
		claims := validClaims()
		claims.ExpiresAt = nil
		_, err := verifyTelegramIDToken(context.Background(), sign(t, claims, kid), clientID)
		require.Error(t, err)
	})

	t.Run("rejects an unknown signing key", func(t *testing.T) {
		other, err := rsa.GenerateKey(rand.Reader, 2048)
		require.NoError(t, err)
		token := jwt.NewWithClaims(jwt.SigningMethodRS256, validClaims())
		token.Header["kid"] = kid
		forged, err := token.SignedString(other)
		require.NoError(t, err)
		_, err = verifyTelegramIDToken(context.Background(), forged, clientID)
		require.Error(t, err)
	})

	t.Run("rejects an unsigned token", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodNone, validClaims())
		token.Header["kid"] = kid
		unsigned, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
		require.NoError(t, err)
		_, err = verifyTelegramIDToken(context.Background(), unsigned, clientID)
		require.Error(t, err)
	})
}

// Telegram publishes RSA and EC keys alongside Ed25519/secp256k1 ones we cannot
// represent; parsing must succeed for the former and be skipped for the latter.
func TestParseJWKSKey(t *testing.T) {
	t.Run("parses RSA", func(t *testing.T) {
		got, err := parseJWKSKey(jwksKey{
			Kty: "RSA",
			Kid: "oidc-1",
			// Values taken from Telegram's live JWKS document.
			N: "5RneLtsKvVcxdv6gu6gxEQu30Cru5NiMQnY6SNr9ZyZFZ4ya-pfHNuaZXJ6QPG0JSFwoxeOkEO2-eZN_REVPm448PvjjsR1eQdZ5QpEkNxnItFcmxkHH91v5cgf52_EI9BGO-MT6f1vaBSg3uWHFlDxI7J2AYxNvd1_Nf3TkgrrR7gyJFTmEIai5RefGnA0KGNYDlRIGUzrz2F05n6gTaHFT_iHL5UHatTZA4GCiUSjIOuwqu5pE5uZge20TFv3cxXMQaFw_xv1pgQt_Rq8eoCN7TS0RQ0zjWKiad-W286BcFectXsUm03p5Nq_kY4mf_7rqwX_B8yy_bBreyKn7RQ",
			E: "AQAB",
		})
		require.NoError(t, err)
		pub, ok := got.(*rsa.PublicKey)
		require.True(t, ok)
		assert.Equal(t, 65537, pub.E)
	})

	t.Run("parses EC P-256", func(t *testing.T) {
		got, err := parseJWKSKey(jwksKey{
			Kty: "EC",
			Kid: "oidc-es256-1",
			Crv: "P-256",
			X:   "ahVYrohhX6YA7w0P2gUNSwMFbaabCgBZFkeq9bWdmwU",
			Y:   "Ea8nKJ34VQMA7zv8aYDfzcBhXEjnWQ9C06jVke_eUV0",
		})
		require.NoError(t, err)
		assert.NotNil(t, got)
	})

	t.Run("rejects unsupported key types", func(t *testing.T) {
		_, err := parseJWKSKey(jwksKey{Kty: "OKP", Kid: "ed25519", Crv: "Ed25519", X: "abc"})
		require.Error(t, err)
	})

	t.Run("rejects unsupported curves", func(t *testing.T) {
		_, err := parseJWKSKey(jwksKey{Kty: "EC", Kid: "k1", Crv: "secp256k1", X: "abc", Y: "def"})
		require.Error(t, err)
	})
}
