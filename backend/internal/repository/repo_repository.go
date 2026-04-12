package repository

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/google/uuid"
)

type RepositoryRepository interface {
	CreateRepository(ctx context.Context, repo *model.Repository) error
	ListRepositories(ctx context.Context) ([]model.Repository, error)
	DeleteRepository(ctx context.Context, id uuid.UUID) error
	GetActiveRepositories(ctx context.Context) ([]model.Repository, error)
	GetRepositoryByID(ctx context.Context, id uuid.UUID) (*model.Repository, error)
	UpdateRepository(ctx context.Context, repo *model.Repository) error
	GetParticipatingRepositories(ctx context.Context) ([]model.RepositoryStats, error)
	
	CreateAttempt(ctx context.Context, attempt *model.IssueAttempt) error
	GetUserAttempts(ctx context.Context, userID uuid.UUID) ([]model.IssueAttempt, error)
	GetAttempt(ctx context.Context, userID uuid.UUID, repoID uuid.UUID, issueNumber int) (*model.IssueAttempt, error)
	UpdateAttemptStatus(ctx context.Context, id uuid.UUID, status string) error
}
