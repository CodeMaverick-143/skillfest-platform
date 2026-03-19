package repository

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PRRepository interface {
	CreateOrUpdate(ctx context.Context, pr *model.PullRequest) error
	GetByUserID(ctx context.Context, userID string) ([]model.PullRequest, error)
	GetByRepoAndNumber(ctx context.Context, repo string, number int) (*model.PullRequest, error)
}
