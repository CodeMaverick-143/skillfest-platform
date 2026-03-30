package service

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type SyncWorker struct {
	userRepo         repository.UserRepository
	githubService    *GitHubService
	contributionRepo repository.ContributionRepository
	repoRepo         repository.RepositoryRepository
	pointsService    *PointsService
}

func NewSyncWorker(userRepo repository.UserRepository, ghService *GitHubService, contributionRepo repository.ContributionRepository, repoRepo repository.RepositoryRepository, pointsService *PointsService) *SyncWorker {
	return &SyncWorker{
		userRepo:         userRepo,
		githubService:    ghService,
		contributionRepo: contributionRepo,
		repoRepo:         repoRepo,
		pointsService:    pointsService,
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
			w.SyncAllRepos(ctx)
		}
	}
}

func (w *SyncWorker) SyncAllRepos(ctx context.Context) {
	log.Println("Starting global sync job...")
	
	repos, err := w.repoRepo.GetActiveRepositories(ctx)
	if err != nil {
		log.Printf("Sync error fetching active repos: %v", err)
		return
	}

	// Fetch all users for mapping
	users, _ := w.userRepo.List(ctx)
	userMap := make(map[string]model.User)
	for _, u := range users {
		userMap[u.Username] = u
	}

	for _, repo := range repos {
		log.Printf("Syncing activities for %s/%s", repo.Owner, repo.Name)
		contributions, err := w.githubService.FetchRepoContributions(ctx, repo)
		if err != nil {
			log.Printf("Error fetching contributions for %s: %v", repo.Name, err)
			continue
		}

		for _, c := range contributions {
			// Extract author from metadata
			var meta struct {
				Author string `json:"author"`
			}
			json.Unmarshal([]byte(c.Metadata), &meta)

			if user, ok := userMap[meta.Author]; ok {
				c.UserID = user.ID
				if err := w.contributionRepo.CreateOrUpdate(ctx, &c); err != nil {
					log.Printf("Error saving contribution: %v", err)
				}
			}
		}
	}

	// Recalculate points for enrolled users
	for _, user := range users {
		if user.IsEnrolled {
			w.pointsService.RecalculateUserLevel(ctx, user.ID)
		}
	}

	log.Println("Global sync job completed.")
}
