package oauth

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rsa"
	"encoding/base64"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/golang-jwt/jwt/v5"
)

type jwksKey struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Alg string `json:"alg"`
	N   string `json:"n"`
	E   string `json:"e"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
}

type jwksDocument struct {
	Keys []jwksKey `json:"keys"`
}

// telegramJWKSCache keeps the fetched signing keys around so every login does
// not re-fetch them, while still allowing a refresh when an unknown `kid`
// appears (Telegram rotating keys, new algorithm selected in BotFather).
var telegramJWKSCache = struct {
	sync.RWMutex
	keys      map[string]any
	fetchedAt time.Time
}{keys: map[string]any{}}

const telegramJWKSTTL = 6 * time.Hour

func telegramSigningKey(ctx context.Context, kid string) (any, error) {
	telegramJWKSCache.RLock()
	key, ok := telegramJWKSCache.keys[kid]
	fresh := time.Since(telegramJWKSCache.fetchedAt) < telegramJWKSTTL
	telegramJWKSCache.RUnlock()
	if ok && fresh {
		return key, nil
	}

	if err := refreshTelegramJWKS(ctx); err != nil {
		// A stale key still beats failing the login outright.
		if ok {
			return key, nil
		}
		return nil, err
	}

	telegramJWKSCache.RLock()
	key, ok = telegramJWKSCache.keys[kid]
	telegramJWKSCache.RUnlock()
	if !ok {
		return nil, fmt.Errorf("telegram jwks has no key for kid %q", kid)
	}
	return key, nil
}

func refreshTelegramJWKS(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, "GET", telegramOIDCJWKSEndpoint, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")

	client := http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram jwks fetch returned status %d", res.StatusCode)
	}

	var doc jwksDocument
	if err := common.DecodeJson(res.Body, &doc); err != nil {
		return err
	}

	parsed := make(map[string]any, len(doc.Keys))
	for _, k := range doc.Keys {
		if k.Kid == "" {
			continue
		}
		pub, err := parseJWKSKey(k)
		if err != nil {
			// Skip curves we cannot represent rather than failing the refresh;
			// Telegram publishes Ed25519/secp256k1 keys we do not accept.
			continue
		}
		parsed[k.Kid] = pub
	}
	if len(parsed) == 0 {
		return errors.New("telegram jwks contained no usable keys")
	}

	telegramJWKSCache.Lock()
	telegramJWKSCache.keys = parsed
	telegramJWKSCache.fetchedAt = time.Now()
	telegramJWKSCache.Unlock()
	return nil
}

func parseJWKSKey(k jwksKey) (any, error) {
	switch k.Kty {
	case "RSA":
		nBytes, err := base64.RawURLEncoding.DecodeString(k.N)
		if err != nil {
			return nil, err
		}
		eBytes, err := base64.RawURLEncoding.DecodeString(k.E)
		if err != nil {
			return nil, err
		}
		return &rsa.PublicKey{
			N: new(big.Int).SetBytes(nBytes),
			E: int(new(big.Int).SetBytes(eBytes).Int64()),
		}, nil
	case "EC":
		var curve elliptic.Curve
		switch k.Crv {
		case "P-256":
			curve = elliptic.P256()
		case "P-384":
			curve = elliptic.P384()
		case "P-521":
			curve = elliptic.P521()
		default:
			return nil, fmt.Errorf("unsupported EC curve %q", k.Crv)
		}
		xBytes, err := base64.RawURLEncoding.DecodeString(k.X)
		if err != nil {
			return nil, err
		}
		yBytes, err := base64.RawURLEncoding.DecodeString(k.Y)
		if err != nil {
			return nil, err
		}
		return &ecdsa.PublicKey{
			Curve: curve,
			X:     new(big.Int).SetBytes(xBytes),
			Y:     new(big.Int).SetBytes(yBytes),
		}, nil
	default:
		return nil, fmt.Errorf("unsupported key type %q", k.Kty)
	}
}

// verifyTelegramIDToken checks the signature against Telegram's published keys
// and validates issuer, audience and expiry before any claim is trusted.
func verifyTelegramIDToken(ctx context.Context, rawToken, clientID string) (*telegramOIDCClaims, error) {
	claims := &telegramOIDCClaims{}
	parser := jwt.NewParser(
		jwt.WithValidMethods([]string{"RS256", "ES256"}),
		jwt.WithIssuer(telegramOIDCIssuer),
		jwt.WithExpirationRequired(),
	)
	_, err := parser.ParseWithClaims(rawToken, claims, func(t *jwt.Token) (any, error) {
		kid, _ := t.Header["kid"].(string)
		if kid == "" {
			return nil, errors.New("telegram id_token has no kid header")
		}
		return telegramSigningKey(ctx, kid)
	})
	if err != nil {
		return nil, err
	}

	// jwt.WithAudience does an exact-match on any entry; check explicitly so the
	// error says which audience arrived.
	audiences, err := claims.GetAudience()
	if err != nil {
		return nil, err
	}
	matched := false
	for _, aud := range audiences {
		if aud == clientID {
			matched = true
			break
		}
	}
	if !matched {
		return nil, fmt.Errorf("telegram id_token audience %v does not match client_id %s", audiences, clientID)
	}

	return claims, nil
}
