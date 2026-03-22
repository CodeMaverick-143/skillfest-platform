package repository

import (
	"context"
	"github.com/google/uuid"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	GetByGitHubID(ctx context.Context, githubID string) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	Update(ctx context.Context, user *model.User) error
	UpdatePoints(ctx context.Context, userID uuid.UUID, points int, level string) error
	GetLeaderboard(ctx context.Context, limit int) ([]model.User, error)
}
