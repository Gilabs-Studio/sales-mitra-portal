package config

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	DatabaseURL       string
	JWTSecret         string
	JWTExpiresIn      time.Duration
	WebOrigin         string
	WebOrigins        []string
	ResendAPIKey      string
	ResendFromEmail   string
	AdminName         string
	AdminUsername     string
	AdminEmail        string
	AdminPassword     string
	DemoPartnerName   string
	DemoPartnerEmail  string
	DemoPartnerPass   string
	ReferralCodeSeed  string
	RunSeeder         bool
	RunCleanup        bool
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2BucketName      string
	R2PublicURL       string
	CerebrasBaseURL   string
	CerebrasAPIKey    string
	CerebrasModel     string
	CerebrasMaxTokens int
	CerebrasTimeout   time.Duration
}

func Load() Config {
	_ = godotenv.Load()

	webOrigin := env("WEB_ORIGIN", "http://localhost:3000")

	return Config{
		Port:              env("PORT", "8080"),
		DatabaseURL:       env("DATABASE_URL", "file:data/mitra-sales.db?cache=shared"),
		JWTSecret:         env("JWT_SECRET", "change-me-in-production"),
		JWTExpiresIn:      durationEnv("JWT_EXPIRES_IN", 24*time.Hour),
		WebOrigin:         webOrigin,
		WebOrigins:        originsEnv("WEB_ORIGIN", webOrigin),
		ResendAPIKey:      env("RESEND_API_KEY", ""),
		ResendFromEmail:   env("RESEND_FROM_EMAIL", ""),
		AdminName:         env("ADMIN_NAME", "GiLabs Admin"),
		AdminUsername:     strings.ToLower(env("ADMIN_USERNAME", "admin")),
		AdminEmail:        strings.ToLower(env("ADMIN_EMAIL", "admin@gilabs.local")),
		AdminPassword:     env("ADMIN_PASSWORD", ""),
		DemoPartnerName:   env("DEMO_PARTNER_NAME", "Mitra Demo"),
		DemoPartnerEmail:  strings.ToLower(env("DEMO_PARTNER_EMAIL", "mitra@gilabs.local")),
		DemoPartnerPass:   env("DEMO_PARTNER_PASSWORD", ""),
		ReferralCodeSeed:  env("REFERRAL_CODE_SEED", "GILABS"),
		RunSeeder:         boolEnv("RUN_SEEDER", true),
		RunCleanup:        boolEnv("RUN_CLEANUP", false),
		R2AccountID:       env("CF_R2_ACCOUNT_ID", ""),
		R2AccessKeyID:     env("CF_R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey: env("CF_R2_SECRET_ACCESS_KEY", ""),
		R2BucketName:      env("CF_R2_BUCKET_NAME", ""),
		R2PublicURL:       env("CF_R2_PUBLIC_URL", ""),
		CerebrasBaseURL:   env("CEREBRAS_BASE_URL", "https://api.cerebras.ai"),
		CerebrasAPIKey:    env("CEREBRAS_API_KEY", ""),
		CerebrasModel:     env("CEREBRAS_MODEL", "gpt-oss-120b"),
		CerebrasMaxTokens: intEnv("CEREBRAS_MAX_COMPLETION_TOKENS", 520),
		CerebrasTimeout:   durationEnv("CEREBRAS_TIMEOUT", 8*time.Second),
	}
}

func originsEnv(key string, fallback string) []string {
	raw := env(key, fallback)
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))

	for _, part := range parts {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		origins = append(origins, origin)
	}

	return origins
}

func env(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func durationEnv(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	duration, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return duration
}

func intEnv(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed := 0
	for _, char := range value {
		if char < '0' || char > '9' {
			return fallback
		}
		parsed = parsed*10 + int(char-'0')
	}
	if parsed <= 0 {
		return fallback
	}
	return parsed
}

func boolEnv(key string, fallback bool) bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if value == "" {
		return fallback
	}
	return value == "true" || value == "1" || value == "yes"
}
