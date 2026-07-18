package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func runOriginGuardRequest(t *testing.T, origin, referer string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/api/user/auth/refresh", SessionCookieOriginGuard(), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})
	request := httptest.NewRequest(http.MethodPost, "https://panel.example.com/api/user/auth/refresh", nil)
	request.Host = "panel.example.com"
	request.Header.Set("Origin", origin)
	if origin == "" {
		request.Header.Del("Origin")
	}
	if referer != "" {
		request.Header.Set("Referer", referer)
	}
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func TestSessionCookieOriginGuard(t *testing.T) {
	previous := common.SessionCookieTrustedURLs
	common.SessionCookieTrustedURLs = []string{"https://trusted.example.com"}
	t.Cleanup(func() { common.SessionCookieTrustedURLs = previous })

	tests := []struct {
		name     string
		origin   string
		referer  string
		expected int
	}{
		{name: "same origin", origin: "https://panel.example.com", expected: http.StatusNoContent},
		{name: "trusted exact origin", origin: "https://trusted.example.com", expected: http.StatusNoContent},
		{name: "referer fallback", referer: "https://panel.example.com/profile", expected: http.StatusNoContent},
		{name: "missing both", expected: http.StatusForbidden},
		{name: "null origin", origin: "null", expected: http.StatusForbidden},
		{name: "suffix attack", origin: "https://trusted.example.com.evil.test", expected: http.StatusForbidden},
		{name: "scheme mismatch", origin: "http://panel.example.com", expected: http.StatusForbidden},
		{name: "path in origin", origin: "https://panel.example.com/profile", expected: http.StatusForbidden},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := runOriginGuardRequest(t, test.origin, test.referer)
			assert.Equal(t, test.expected, response.Code)
			assert.Empty(t, response.Header().Get("Access-Control-Allow-Origin"))
		})
	}
}

func TestSessionCookieOriginGuardDoesNotTrustForwardedProtoFromClient(t *testing.T) {
	previous := common.SessionCookieTrustedURLs
	common.SessionCookieTrustedURLs = nil
	t.Cleanup(func() { common.SessionCookieTrustedURLs = previous })

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/api/user/auth/refresh", SessionCookieOriginGuard(), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})
	request := httptest.NewRequest(http.MethodPost, "http://panel.example.com/api/user/auth/refresh", nil)
	request.Host = "panel.example.com"
	request.Header.Set("Origin", "https://panel.example.com")
	request.Header.Set("X-Forwarded-Proto", "https")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusForbidden, response.Code)
}
