package repository

import (
	"context"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/google/uuid"
)

type ContributionRepository interface {
	CreateOrUpdate(ctx context.Context, c *model.Contribution) error
	ListByUser(ctx context.Context, userID uuid.UUID) ([]model.Contribution, error)
	ListByRepo(ctx context.Context, repoID uuid.UUID) ([]model.Contribution, error)
	GetUserAnalytics(ctx context.Context, userID uuid.UUID, since, until time.Time) ([]model.Contribution, error)
	GetFilteredByUser(ctx context.Context, userID uuid.UUID) ([]model.Contribution, error)
	GetLeaderboard(ctx context.Context, since, until time.Time) ([]model.LeaderboardEntry, error)
}
