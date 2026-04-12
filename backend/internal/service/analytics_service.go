package service

import (
	"context"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
	"github.com/google/uuid"
)

type LeaderboardEntry struct {
	UserID uuid.UUID `json:"user_id"`
	Points int       `json:"points"`
}

type AnalyticsService struct {
	contributionRepo repository.ContributionRepository
	cacheService     CacheService
}

func NewAnalyticsService(contributionRepo repository.ContributionRepository, cache CacheService) *AnalyticsService {
	return &AnalyticsService{
		contributionRepo: contributionRepo,
		cacheService:     cache,
	}
}

func (s *AnalyticsService) GetUserProgress(ctx context.Context, userID uuid.UUID) (map[string]interface{}, error) {
	contributions, err := s.contributionRepo.ListByUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	totalPoints := 0
	typeBreakdown := make(map[string]int)
	repoBreakdown := make(map[uuid.UUID]int)

	for _, c := range contributions {
		totalPoints += c.Points
		typeBreakdown[c.Type]++
		if c.RepoID != nil {
			repoBreakdown[*c.RepoID] += c.Points
		}
	}

	return map[string]interface{}{
		"total_points":   totalPoints,
		"type_breakdown": typeBreakdown,
		"repo_breakdown": repoBreakdown,
		"contributions":  contributions,
	}, nil
}

func (s *AnalyticsService) GetLeaderboard(ctx context.Context, since, until time.Time) ([]LeaderboardEntry, error) {
	results, err := s.contributionRepo.GetLeaderboard(ctx, since, until)
	if err != nil {
		return nil, err
	}

	var entries []LeaderboardEntry
	for _, r := range results {
		entries = append(entries, LeaderboardEntry{
			UserID: r.UserID,
			Points: r.Points,
		})
	}
	return entries, nil
}
