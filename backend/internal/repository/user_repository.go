package repository

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	GetByID(ctx context.Context, id string) (*model.User, error)
	GetByGitHubID(ctx context.Context, githubID string) (*model.User, error)
	UpdatePoints(ctx context.Context, userID string, points int, level string) error
	GetLeaderboard(ctx context.Context, limit int) ([]model.User, error)
}
