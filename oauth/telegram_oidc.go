package oauth

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Telegram retired the Login Widget's domain allow-list: BotFather's new panel
// only exposes OIDC credentials, and oauth.telegram.org/embed/<bot> answers
// "Bot domain invalid" no matter what /setdomain reports. This provider speaks
// Telegram's OIDC flow instead, so Telegram sign-in keeps working.
//
// Registered under its own slug so the generic `oidc` provider stays free for
// whatever identity provider the operator already configured.
const TelegramOIDCProviderSlug = "telegram_oidc"

const (
	telegramOIDCIssuer        = "https://oauth.telegram.org"
	telegramOIDCAuthEndpoint  = "https://oauth.telegram.org/auth"
	telegramOIDCTokenEndpoint = "https://oauth.telegram.org/token"
	telegramOIDCJWKSEndpoint  = "https://oauth.telegram.org/.well-known/jwks.json"
	// Telegram ships every claim inside the ID token — there is no UserInfo
	// endpoint to call.
	telegramOIDCScopes = "openid profile"
)

func init() {
	Register(TelegramOIDCProviderSlug, &TelegramOIDCProvider{})
}

type TelegramOIDCProvider struct{}

// telegramOIDCClientID derives the OAuth client_id from the bot token. Telegram
// bot tokens are `<bot_id>:<secret>` and the bot id doubles as the OIDC
// client_id, so operators do not have to copy it in separately.
func telegramOIDCClientID() string {
	token := strings.TrimSpace(common.TelegramBotToken)
	if token == "" {
		return ""
	}
	botID, _, found := strings.Cut(token, ":")
	if !found {
		return ""
	}
	if _, err := strconv.ParseInt(botID, 10, 64); err != nil {
		return ""
	}
	return botID
}

func (p *TelegramOIDCProvider) GetName() string {
	return "Telegram"
}

// RequiresPKCE reports that Telegram's token endpoint expects a code_verifier.
func (p *TelegramOIDCProvider) RequiresPKCE() bool { return true }

// IsEnabled requires both the bot token (for client_id) and the separate Login
// Widget client secret from BotFather, which is not the bot token.
func (p *TelegramOIDCProvider) IsEnabled() bool {
	return common.TelegramOAuthEnabled &&
		telegramOIDCClientID() != "" &&
		strings.TrimSpace(common.TelegramClientSecret) != ""
}

// AuthorizationURL builds the URL the browser is sent to. The caller supplies
// the state it already tracks for CSRF and the PKCE challenge it stored
// alongside it.
func (p *TelegramOIDCProvider) AuthorizationURL(state, codeChallenge string) string {
	values := url.Values{}
	values.Set("client_id", telegramOIDCClientID())
	values.Set("redirect_uri", telegramOIDCRedirectURI())
	values.Set("response_type", "code")
	values.Set("scope", telegramOIDCScopes)
	values.Set("state", state)
	if codeChallenge != "" {
		values.Set("code_challenge", codeChallenge)
		values.Set("code_challenge_method", "S256")
	}
	return telegramOIDCAuthEndpoint + "?" + values.Encode()
}

// truncateForLog keeps provider error payloads readable in logs without letting
// an unexpected response flood them.
func truncateForLog(body []byte) string {
	const limit = 512
	s := strings.TrimSpace(string(body))
	if len(s) > limit {
		return s[:limit] + "…"
	}
	return s
}

func telegramOIDCRedirectURI() string {
	base := strings.TrimRight(strings.TrimSpace(system_setting.ServerAddress), "/")
	return base + "/oauth/" + TelegramOIDCProviderSlug
}

type telegramOIDCTokenResponse struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
}

// telegramExchange posts the authorization code once, authenticating either via
// the Basic header (client_secret_basic) or in the form body
// (client_secret_post). It returns the decoded response plus the raw body and
// status so the caller can report exactly what Telegram said.
func telegramExchange(
	ctx context.Context,
	clientID, clientSecret, code, verifier string,
	useBasicAuth bool,
) (telegramOIDCTokenResponse, []byte, int, error) {
	var empty telegramOIDCTokenResponse

	values := url.Values{}
	values.Set("grant_type", "authorization_code")
	values.Set("code", code)
	values.Set("redirect_uri", telegramOIDCRedirectURI())
	values.Set("client_id", clientID)
	if verifier != "" {
		values.Set("code_verifier", verifier)
	}
	if !useBasicAuth {
		values.Set("client_secret", clientSecret)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", telegramOIDCTokenEndpoint, strings.NewReader(values.Encode()))
	if err != nil {
		return empty, nil, 0, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	if useBasicAuth {
		basic := base64.StdEncoding.EncodeToString([]byte(clientID + ":" + clientSecret))
		req.Header.Set("Authorization", "Basic "+basic)
	}

	client := http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		logger.LogError(ctx, fmt.Sprintf("[OAuth-TelegramOIDC] ExchangeToken error: %s", err.Error()))
		return empty, nil, 0, NewOAuthErrorWithRaw(i18n.MsgOAuthConnectFailed, map[string]any{"Provider": "Telegram"}, err.Error())
	}
	defer res.Body.Close()

	// Read the body first: Telegram answers 200 with an error object rather than
	// an error status, and without the payload there is nothing to diagnose from.
	body, err := io.ReadAll(io.LimitReader(res.Body, 64<<10))
	if err != nil {
		logger.LogError(ctx, fmt.Sprintf("[OAuth-TelegramOIDC] ExchangeToken read error: %s", err.Error()))
		return empty, nil, res.StatusCode, err
	}

	var tokenRes telegramOIDCTokenResponse
	if err := common.Unmarshal(body, &tokenRes); err != nil {
		logger.LogError(ctx, fmt.Sprintf("[OAuth-TelegramOIDC] ExchangeToken decode error: %s (status=%d body=%s)",
			err.Error(), res.StatusCode, truncateForLog(body)))
		return empty, body, res.StatusCode, err
	}
	return tokenRes, body, res.StatusCode, nil
}

func (p *TelegramOIDCProvider) ExchangeToken(ctx context.Context, code string, c *gin.Context) (*OAuthToken, error) {
	if code == "" {
		return nil, NewOAuthError(i18n.MsgOAuthInvalidCode, nil)
	}

	clientID := telegramOIDCClientID()
	clientSecret := strings.TrimSpace(common.TelegramClientSecret)
	if clientID == "" || clientSecret == "" {
		return nil, NewOAuthError(i18n.MsgOAuthTokenFailed, map[string]any{"Provider": "Telegram"})
	}

	verifier := pkceCodeVerifier(c)

	// Telegram advertises both client_secret_basic and client_secret_post. Some
	// deployments reject the Basic header with invalid_client, so fall back to
	// sending the credentials in the form body before giving up.
	tokenRes, body, status, err := telegramExchange(ctx, clientID, clientSecret, code, verifier, true)
	if err != nil {
		return nil, err
	}
	if tokenRes.IDToken == "" {
		logger.LogDebug(ctx, "[OAuth-TelegramOIDC] basic auth exchange returned no id_token (status=%d body=%s), retrying with client_secret_post",
			status, truncateForLog(body))
		tokenRes, body, status, err = telegramExchange(ctx, clientID, clientSecret, code, verifier, false)
		if err != nil {
			return nil, err
		}
	}

	if tokenRes.IDToken == "" {
		logger.LogError(ctx, fmt.Sprintf("[OAuth-TelegramOIDC] ExchangeToken failed: no id_token (status=%d body=%s)",
			status, truncateForLog(body)))
		return nil, NewOAuthError(i18n.MsgOAuthTokenFailed, map[string]any{"Provider": "Telegram"})
	}

	return &OAuthToken{
		AccessToken: tokenRes.AccessToken,
		TokenType:   tokenRes.TokenType,
		ExpiresIn:   tokenRes.ExpiresIn,
		Scope:       tokenRes.Scope,
		IDToken:     tokenRes.IDToken,
	}, nil
}

// telegramOIDCClaims mirrors the claims Telegram documents for its ID token.
// `TelegramID` is the numeric Telegram user id the legacy Login Widget stored,
// which is what lets already-linked accounts keep working; `Subject` is the
// OIDC subject and is only used when the numeric id is absent.
type telegramOIDCClaims struct {
	Subject           string `json:"sub"`
	TelegramID        int64  `json:"id"`
	Name              string `json:"name"`
	PreferredUsername string `json:"preferred_username"`
	Picture           string `json:"picture"`
	PhoneNumber       string `json:"phone_number"`
	jwt.RegisteredClaims
}

func (p *TelegramOIDCProvider) GetUserInfo(ctx context.Context, token *OAuthToken) (*OAuthUser, error) {
	if token == nil || token.IDToken == "" {
		return nil, NewOAuthError(i18n.MsgOAuthGetUserErr, nil)
	}

	claims, err := verifyTelegramIDToken(ctx, token.IDToken, telegramOIDCClientID())
	if err != nil {
		logger.LogError(ctx, fmt.Sprintf("[OAuth-TelegramOIDC] id_token verification failed: %s", err.Error()))
		return nil, NewOAuthErrorWithRaw(i18n.MsgOAuthGetUserErr, nil, err.Error())
	}

	// Prefer the numeric Telegram id so accounts linked through the old Login
	// Widget (which stored exactly this value) match without re-linking.
	providerUserID := ""
	if claims.TelegramID != 0 {
		providerUserID = strconv.FormatInt(claims.TelegramID, 10)
	} else if claims.Subject != "" {
		providerUserID = claims.Subject
	}
	if providerUserID == "" {
		return nil, NewOAuthError(i18n.MsgOAuthUserInfoEmpty, map[string]any{"Provider": "Telegram"})
	}

	logger.LogDebug(ctx, "[OAuth-TelegramOIDC] GetUserInfo: id=%d sub=%s username=%s",
		claims.TelegramID, claims.Subject, claims.PreferredUsername)

	return &OAuthUser{
		ProviderUserID: providerUserID,
		Username:       claims.PreferredUsername,
		DisplayName:    claims.Name,
		Extra: map[string]any{
			"picture": claims.Picture,
			"sub":     claims.Subject,
		},
	}, nil
}

func (p *TelegramOIDCProvider) IsUserIDTaken(providerUserID string) bool {
	return model.IsTelegramIdAlreadyTaken(providerUserID)
}

func (p *TelegramOIDCProvider) FillUserByProviderID(user *model.User, providerUserID string) error {
	user.TelegramId = providerUserID
	return user.FillUserByTelegramId()
}

func (p *TelegramOIDCProvider) SetProviderUserID(user *model.User, providerUserID string) {
	user.TelegramId = providerUserID
}

func (p *TelegramOIDCProvider) GetProviderPrefix() string {
	return "tg_"
}
