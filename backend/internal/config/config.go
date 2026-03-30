package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	GitHubClientID          string
	GitHubClientSecret      string
	AdminGitHubClientID     string
	AdminGitHubClientSecret string
	DatabaseURL             string
	Port                    string
	JWTSecret               string
	FrontendURL             string
	BackendURL              string
	GoogleClientID          string
	GoogleClientSecret      string
	MongoDBURI              string
	RedisURL                string
	AdminFrontendURL        string
	AdminUsernames          string
	CloseEventPassword      string // Validated server-side for event close action
	AdditionalCORSOrigins   string // Comma-separated extra allowed origins
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	return &Config{
		GitHubClientID:          os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret:      os.Getenv("GITHUB_CLIENT_SECRET"),
		AdminGitHubClientID:     os.Getenv("ADMIN_GITHUB_CLIENT_ID"),
		AdminGitHubClientSecret: os.Getenv("ADMIN_GITHUB_CLIENT_SECRET"),
		DatabaseURL:             os.Getenv("DATABASE_URL"),
		Port:                    getEnv("PORT", "8080"),
		JWTSecret:               getEnv("JWT_SECRET", "super-secret-key"),
		FrontendURL:             getEnv("FRONTEND_URL", "http://localhost:3000"),
		BackendURL:              getEnv("BACKEND_URL", "http://localhost:8080"),
		GoogleClientID:          os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:      os.Getenv("GOOGLE_CLIENT_SECRET"),
		MongoDBURI:              getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		RedisURL:                getEnv("REDIS_URL", "localhost:6379"),
		AdminFrontendURL:        getEnv("ADMIN_FRONTEND_URL", "http://localhost:4321"),
		AdminUsernames:          os.Getenv("ADMIN_GITHUB_USERNAMES"),
		CloseEventPassword:      getEnv("CLOSE_EVENT_PASSWORD", ""),
		AdditionalCORSOrigins:   os.Getenv("ADDITIONAL_CORS_ORIGINS"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
