package service

import (
	"context"
	"time"
	"github.com/google/uuid"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type PointsService struct {
	userRepo         repository.UserRepository
	prRepo           repository.PRRepository
	repoRepo         repository.RepositoryRepository
	contributionRepo repository.ContributionRepository
}

func NewPointsService(userRepo repository.UserRepository, prRepo repository.PRRepository, repoRepo repository.RepositoryRepository, contributionRepo repository.ContributionRepository) *PointsService {
	return &PointsService{userRepo: userRepo, prRepo: prRepo, repoRepo: repoRepo, contributionRepo: contributionRepo}
}

func (s *PointsService) RecalculateUserLevel(ctx context.Context, userID uuid.UUID) error {
	// Use the optimized SQL-level filtering method to get all valid contributions
	contributions, err := s.contributionRepo.GetFilteredByUser(ctx, userID)
	if err != nil {
		return err
	}

	totalPoints := 0
	var lastContribution time.Time

	for _, c := range contributions {
		totalPoints += c.Points
		if c.OccurredAt.After(lastContribution) {
			lastContribution = c.OccurredAt
		}
	}

	if lastContribution.IsZero() {
		user, err := s.userRepo.GetByID(ctx, userID)
		if err == nil {
			lastContribution = user.CreatedAt
		} else {
			lastContribution = time.Now()
		}
	}

	level := "Explorer"
	user, err := s.userRepo.GetByID(ctx, userID)
	if err == nil {
		user.Points = totalPoints
		level = user.CalculateLevel()
	} else {
		// Fallback logic if user not found (shouldn't happen here)
		tempUser := model.User{Points: totalPoints}
		level = tempUser.CalculateLevel()
	}

	return s.userRepo.UpdatePoints(ctx, userID, totalPoints, level, lastContribution)
}
