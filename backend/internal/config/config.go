package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	GitHubClientID     string
	GitHubClientSecret string
	DatabaseURL        string
	Port               string
	JWTSecret          string
	FrontendURL        string
	BackendURL         string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	return &Config{
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		Port:               getEnv("PORT", "8080"),
		JWTSecret:          getEnv("JWT_SECRET", "super-secret-key"),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:3000"),
		BackendURL:         getEnv("BACKEND_URL", "http://localhost:8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
