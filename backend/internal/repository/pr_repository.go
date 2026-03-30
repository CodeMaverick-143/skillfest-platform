package repository

import (
	"context"
	"github.com/google/uuid"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PRRepository interface {
	CreateOrUpdate(ctx context.Context, pr *model.PullRequest) error
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]model.PullRequest, error)
	GetByRepoAndNumber(ctx context.Context, repo string, number int) (*model.PullRequest, error)
	ListAll(ctx context.Context) ([]model.PullRequest, error)
	GetFilteredByUser(ctx context.Context, userID uuid.UUID) ([]model.PullRequest, error)
}
