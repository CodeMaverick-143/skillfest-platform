package config

import (
	"os"
)

type Config struct {
	GitHubClientID     string
	GitHubClientSecret string
	DatabaseURL        string
	Port               string
}

func LoadConfig() *Config {
	return &Config{
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		Port:               getEnv("PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
