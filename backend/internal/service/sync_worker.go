package service

import (
	"context"
	"log"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type SyncWorker struct {
	userRepo      repository.UserRepository
	githubService *GitHubService
	prRepo        repository.PRRepository
	pointsService *PointsService
}

func NewSyncWorker(userRepo repository.UserRepository, ghService *GitHubService, prRepo repository.PRRepository, pointsService *PointsService) *SyncWorker {
	return &SyncWorker{
		userRepo:      userRepo,
		githubService: ghService,
		prRepo:        prRepo,
		pointsService: pointsService,
	}
}

func (w *SyncWorker) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.SyncAllUsers(ctx)
		}
	}
}

func (w *SyncWorker) SyncAllUsers(ctx context.Context) {
	log.Println("Starting PR sync job...")
	// In a real app, we'd paginate users
	users, err := w.userRepo.GetLeaderboard(ctx, 1000)
	if err != nil {
		log.Printf("Sync error fetching users: %v", err)
		return
	}

	for _, user := range users {
		// Only sync for enrolled users
		if !user.IsEnrolled {
			continue
		}

		prs, err := w.githubService.FetchAndValidatePRs(ctx, user.Username)
		if err != nil {
			log.Printf("Sync error fetching PRs for user %s: %v", user.Username, err)
			continue
		}

		for _, pr := range prs {
			pr.UserID = user.ID
			// Points are now determined by the GitHubService based on labels
			if err := w.prRepo.CreateOrUpdate(ctx, &pr); err != nil {
				log.Printf("Sync error saving PR %s#%d: %v", pr.RepoName, pr.PRNumber, err)
			}
		}

		if err := w.pointsService.RecalculateUserLevel(ctx, user.ID); err != nil {
			log.Printf("Sync error recalculating points for user %s: %v", user.Username, err)
		}
	}
	log.Println("PR sync job completed.")
}
