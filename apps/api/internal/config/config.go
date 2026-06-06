package config

import (
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DatabaseURL      string
	JWTSecret        string
	JWTExpiresIn     time.Duration
	WebOrigin        string
	AdminName        string
	AdminEmail       string
	AdminPassword    string
	DemoPartnerName  string
	DemoPartnerEmail string
	DemoPartnerPass  string
	ReferralCodeSeed string
}

func Load() Config {
	_ = godotenv.Load()

	return Config{
		Port:             env("PORT", "8080"),
		DatabaseURL:      env("DATABASE_URL", "file:data/mitra-sales.db?cache=shared"),
		JWTSecret:        env("JWT_SECRET", "change-me-in-production"),
		JWTExpiresIn:     durationEnv("JWT_EXPIRES_IN", 24*time.Hour),
		WebOrigin:        env("WEB_ORIGIN", "http://localhost:3000"),
		AdminName:        env("ADMIN_NAME", "GiLabs Admin"),
		AdminEmail:       strings.ToLower(env("ADMIN_EMAIL", "admin@gilabs.local")),
		AdminPassword:    env("ADMIN_PASSWORD", "admin12345"),
		DemoPartnerName:  env("DEMO_PARTNER_NAME", "Mitra Demo"),
		DemoPartnerEmail: strings.ToLower(env("DEMO_PARTNER_EMAIL", "mitra@gilabs.local")),
		DemoPartnerPass:  env("DEMO_PARTNER_PASSWORD", "mitra12345"),
		ReferralCodeSeed: env("REFERRAL_CODE_SEED", "GILABS"),
	}
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
