package service

import (
	"context"
	"fmt"
	"strings"
	"time"
	"github.com/google/uuid"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type AdminService struct {
	fresherRepo      repository.FresherRepository
	userRepo         repository.UserRepository
	prRepo           repository.PRRepository
	contributionRepo repository.ContributionRepository
	repoRepo         repository.RepositoryRepository
	pointsService    *PointsService
}

func NewAdminService(fresher repository.FresherRepository, user repository.UserRepository, pr repository.PRRepository, contributionRepo repository.ContributionRepository, repoRepo repository.RepositoryRepository, points *PointsService) *AdminService {
	return &AdminService{
		fresherRepo:      fresher,
		userRepo:         user,
		prRepo:           pr,
		contributionRepo: contributionRepo,
		repoRepo:         repoRepo,
		pointsService:    points,
	}
}

func (s *AdminService) AuthorizePR(ctx context.Context, prID uuid.UUID, adminUsername string) error {
	allPrs, err := s.prRepo.ListAll(ctx) // This is inefficient but fits current repo interface
	if err != nil {
		return err
	}
	var targetPR *model.PullRequest
	for i := range allPrs {
		if allPrs[i].ID == prID {
			targetPR = &allPrs[i]
			break
		}
	}
	if targetPR == nil {
		return fmt.Errorf("PR not found")
	}

	targetPR.ReviewStatus = "approved"
	targetPR.ReviewedBy = adminUsername
	if err := s.prRepo.CreateOrUpdate(ctx, targetPR); err != nil {
		return err
	}

	// Update corresponding contribution
	// We need to find the repo first to get its ID
	repos, _ := s.repoRepo.ListRepositories(ctx)
	var repoID uuid.UUID
	for _, r := range repos {
		targetLower := strings.ToLower(targetPR.RepoName)
		repoNameLower := strings.ToLower(r.Name)
		repoFullLower := strings.ToLower(r.Owner + "/" + r.Name)
		if targetLower == repoNameLower || targetLower == repoFullLower {
			repoID = r.ID
			break
		}
	}

	occurredAt := time.Now()
	if targetPR.MergedAt != nil {
		occurredAt = *targetPR.MergedAt
	}

	// Contribution update logic
	contribution := &model.Contribution{
		UserID:     targetPR.UserID,
		RepoID:     &repoID,
		Type:       "PR",
		ExternalID: fmt.Sprintf("%d", targetPR.PRNumber),
		Points:     targetPR.Points, // awarding the points set during sync
		OccurredAt: occurredAt,
	}

	if err := s.contributionRepo.CreateOrUpdate(ctx, contribution); err != nil {
		return err
	}

	return s.pointsService.RecalculateUserLevel(ctx, targetPR.UserID)
}

func (s *AdminService) RejectPR(ctx context.Context, prID uuid.UUID, adminUsername string) error {
	allPrs, err := s.prRepo.ListAll(ctx)
	if err != nil {
		return err
	}
	var targetPR *model.PullRequest
	for i := range allPrs {
		if allPrs[i].ID == prID {
			targetPR = &allPrs[i]
			break
		}
	}
	if targetPR == nil {
		return fmt.Errorf("PR not found")
	}

	targetPR.ReviewStatus = "rejected"
	targetPR.ReviewedBy = adminUsername
	return s.prRepo.CreateOrUpdate(ctx, targetPR)
}

func (s *AdminService) AuthorizeAllPRs(ctx context.Context, adminUsername string) error {
	prs, err := s.ListMergedPRs(ctx)
	if err != nil {
		return err
	}

	for _, pr := range prs {
		if pr.ReviewStatus == "pending" || pr.ReviewStatus == "" {
			if err := s.AuthorizePR(ctx, pr.ID, adminUsername); err != nil {
				// We log and continue so one failure doesn't block all
				fmt.Printf("Error authorizing PR %s: %v\n", pr.ID, err)
			}
		}
	}
	return nil
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
	// 1. Get all current contributions to calculate the "automated" sum
	contributions, err := s.contributionRepo.ListByUser(ctx, userID)
	if err != nil {
		return err
	}

	automatedPoints := 0
	for _, c := range contributions {
		if c.Type != "Manual Adjustment" {
			automatedPoints += c.Points
		}
	}

	// 2. Calculate the needed adjustment
	adjustmentDelta := points - automatedPoints

	// 3. Create or Update the manual adjustment contribution
	// We use a deterministic ExternalID to allow updating the same adjustment
	adj := &model.Contribution{
		UserID:     userID,
		RepoID:     nil, // Global adjustment
		Type:       "Manual Adjustment",
		ExternalID: fmt.Sprintf("manual-%s", userID.String()),
		Points:     adjustmentDelta,
		OccurredAt: time.Now(),
		Metadata:   `{"reason": "Manual administrative point adjustment"}`,
	}

	if err := s.contributionRepo.CreateOrUpdate(ctx, adj); err != nil {
		return err
	}

	// 4. Trigger a full recalculation to update the User record and level
	return s.pointsService.RecalculateUserLevel(ctx, userID)
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
	merged := make([]model.PullRequest, 0)
	for _, pr := range allPrs {
		if pr.State != "merged" {
			continue
		}

		for _, repo := range repos {
			if pr.RepoName == repo.Name || pr.RepoName == repo.Owner+"/"+repo.Name {
				if pr.MergedAt != nil {
					validStart := repo.StartDate.IsZero() || pr.MergedAt.After(repo.StartDate) || pr.MergedAt.Equal(repo.StartDate)
					validEnd := repo.EndDate.IsZero() || pr.MergedAt.Before(repo.EndDate) || pr.MergedAt.Equal(repo.EndDate)
					if validStart && validEnd {
						merged = append(merged, pr)
						break
					}
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
