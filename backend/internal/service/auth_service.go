package service

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/config"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type AuthService struct {
	config     *config.Config
	userRepo   repository.UserRepository
	jwtSecret  []byte
}

func NewAuthService(cfg *config.Config, userRepo repository.UserRepository) *AuthService {
	return &AuthService{
		config:    cfg,
		userRepo:  userRepo,
		jwtSecret: []byte("REPLACE_WITH_SECURE_SECRET"), // Load from env in production
	}
}

func (s *AuthService) CreateSession(ctx context.Context, user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *AuthService) ValidateSession(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims["user_id"].(string), nil
	}
	return "", fmt.Errorf("invalid claims")
}
