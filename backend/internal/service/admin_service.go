package service

import (
	"context"
	"time"
	"github.com/google/uuid"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type AdminService struct {
	fresherRepo repository.FresherRepository
	userRepo    repository.UserRepository
	prRepo           repository.PRRepository
	contributionRepo repository.ContributionRepository
	repoRepo         repository.RepositoryRepository
}

func NewAdminService(fresher repository.FresherRepository, user repository.UserRepository, pr repository.PRRepository, contributionRepo repository.ContributionRepository, repoRepo repository.RepositoryRepository) *AdminService {
	return &AdminService{
		fresherRepo:      fresher,
		userRepo:         user,
		prRepo:           pr,
		contributionRepo: contributionRepo,
		repoRepo:         repoRepo,
	}
}

func (s *AdminService) SubmitApplication(ctx context.Context, app *model.FresherApplication) error {
	return s.fresherRepo.CreateApplication(ctx, app)
}

func (s *AdminService) ListApplications(ctx context.Context) ([]model.FresherApplication, error) {
	return s.fresherRepo.ListApplications(ctx)
}

func (s *AdminService) ReviewApplication(ctx context.Context, id uuid.UUID, status string) error {
	return s.fresherRepo.UpdateStatus(ctx, id, status)
}

func (s *AdminService) GetStats(ctx context.Context) (map[string]interface{}, error) {
	users, err := s.userRepo.List(ctx)
	if err != nil {
		return nil, err
	}
	prs, err := s.prRepo.ListAll(ctx)
	if err != nil {
		return nil, err
	}
	repos, err := s.repoRepo.GetActiveRepositories(ctx)
	if err != nil {
		repos = []model.Repository{}
	}

	mergedCount := 0
	totalFilteredPRs := 0
	for _, pr := range prs {
		// Only count PRs for active repos in timeframe
		isValid := false
		for _, repo := range repos {
			if pr.RepoName == repo.Name || pr.RepoName == repo.Owner+"/"+repo.Name {
				if pr.MergedAt != nil && pr.MergedAt.After(repo.StartDate) && pr.MergedAt.Before(repo.EndDate) {
					isValid = true
					break
				}
			}
		}

		if isValid {
			totalFilteredPRs++
			if pr.State == "merged" {
				mergedCount++
			}
		}
	}

	return map[string]interface{}{
		"total_users":  len(users),
		"total_prs":    totalFilteredPRs,
		"merged_prs":   mergedCount,
		"active_users": 0,
	}, nil
}

func (s *AdminService) ListUsers(ctx context.Context) ([]model.User, error) {
	return s.userRepo.List(ctx)
}

func (s *AdminService) UpdateUserPoints(ctx context.Context, userID uuid.UUID, points int) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	user.Points = points
	user.Level = user.CalculateLevel()
	user.LastScoreUpdatedAt = time.Now()
	return s.userRepo.Update(ctx, user)
}

func (s *AdminService) UpdateUserStatus(ctx context.Context, userID uuid.UUID, isHidden bool, isBanned bool, isAdmin bool, isReviewer bool) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	user.IsHidden = isHidden
	user.IsBanned = isBanned
	user.IsAdmin = isAdmin
	user.IsReviewer = isReviewer
	return s.userRepo.Update(ctx, user)
}

func (s *AdminService) ListMergedPRs(ctx context.Context) ([]model.PullRequest, error) {
	allPrs, err := s.prRepo.ListAll(ctx)
	if err != nil {
		return nil, err
	}
	
	repos, _ := s.repoRepo.GetActiveRepositories(ctx)
	var merged []model.PullRequest
	for _, pr := range allPrs {
		if pr.State != "merged" {
			continue
		}

		for _, repo := range repos {
			if pr.RepoName == repo.Name || pr.RepoName == repo.Owner+"/"+repo.Name {
				if pr.MergedAt != nil && pr.MergedAt.After(repo.StartDate) && pr.MergedAt.Before(repo.EndDate) {
					merged = append(merged, pr)
					break
				}
			}
		}
	}
	return merged, nil
}

func (s *AdminService) ListRepositories(ctx context.Context) ([]model.Repository, error) {
	return s.repoRepo.ListRepositories(ctx)
}

func (s *AdminService) AddRepository(ctx context.Context, repo *model.Repository) error {
	return s.repoRepo.CreateRepository(ctx, repo)
}

func (s *AdminService) DeleteRepository(ctx context.Context, id uuid.UUID) error {
	return s.repoRepo.DeleteRepository(ctx, id)
}

func (s *AdminService) UpdateRepository(ctx context.Context, repo *model.Repository) error {
	return s.repoRepo.UpdateRepository(ctx, repo)
}
