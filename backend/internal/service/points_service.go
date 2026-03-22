package service

import (
	"context"
	"github.com/google/uuid"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type PointsService struct {
	userRepo   repository.UserRepository
	prRepo     repository.PRRepository
}

func NewPointsService(userRepo repository.UserRepository, prRepo repository.PRRepository) *PointsService {
	return &PointsService{userRepo: userRepo, prRepo: prRepo}
}

func (s *PointsService) RecalculateUserLevel(ctx context.Context, userID uuid.UUID) error {
	prs, err := s.prRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	totalPoints := 0
	for _, pr := range prs {
		if pr.State == "merged" { 
			totalPoints += pr.Points
		}
	}

	level := "Newcomer"
	switch {
	case totalPoints >= 500:
		level = "Expert"
	case totalPoints >= 300:
		level = "Advanced"
	case totalPoints >= 150:
		level = "Intermediate"
	case totalPoints >= 50:
		level = "Beginner"
	}

	return s.userRepo.UpdatePoints(ctx, userID, totalPoints, level)
}
