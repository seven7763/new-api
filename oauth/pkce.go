package oauth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"

	"github.com/gin-gonic/gin"
)

// contextKeyPKCECodeVerifier carries the PKCE verifier from the callback handler
// that loaded the pending flow into the provider's ExchangeToken.
const contextKeyPKCECodeVerifier = "oauth_pkce_code_verifier"

// SetPKCECodeVerifier records the PKCE verifier for the in-flight exchange. The
// OAuth callback resolves it from the pending flow's payload before invoking
// ExchangeToken, so the verifier never reaches the browser.
func SetPKCECodeVerifier(c *gin.Context, verifier string) {
	if c == nil || verifier == "" {
		return
	}
	c.Set(contextKeyPKCECodeVerifier, verifier)
}

func pkceCodeVerifier(c *gin.Context) string {
	if c == nil {
		return ""
	}
	if v, ok := c.Get(contextKeyPKCECodeVerifier); ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

// PKCEProvider is implemented by providers whose token exchange requires a PKCE
// code_verifier. The flow generator creates the pair up front and stores the
// verifier server-side.
type PKCEProvider interface {
	RequiresPKCE() bool
}

// AuthorizationURLBuilder is implemented by providers that own their authorize
// URL, so the frontend can redirect without duplicating endpoint knowledge.
type AuthorizationURLBuilder interface {
	AuthorizationURL(state, codeChallenge string) string
}

// NewPKCEPair returns a fresh verifier and its S256 challenge, both in the
// base64url-without-padding form RFC 7636 requires.
func NewPKCEPair() (verifier string, challenge string, err error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}
	verifier = base64.RawURLEncoding.EncodeToString(raw)
	sum := sha256.Sum256([]byte(verifier))
	challenge = base64.RawURLEncoding.EncodeToString(sum[:])
	return verifier, challenge, nil
}
