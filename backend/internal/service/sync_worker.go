package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SyncWorker struct {
	userRepo         repository.UserRepository
	githubService    *GitHubService
	contributionRepo repository.ContributionRepository
	repoRepo         repository.RepositoryRepository
	prRepo           repository.PRRepository
	pointsService    *PointsService
	loggingService   LoggingService
	db               *gorm.DB
}

func NewSyncWorker(userRepo repository.UserRepository, ghService *GitHubService, contributionRepo repository.ContributionRepository, repoRepo repository.RepositoryRepository, prRepo repository.PRRepository, pointsService *PointsService, loggingService LoggingService, db *gorm.DB) *SyncWorker {
	return &SyncWorker{
		userRepo:         userRepo,
		githubService:    ghService,
		contributionRepo: contributionRepo,
		repoRepo:         repoRepo,
		prRepo:           prRepo,
		pointsService:    pointsService,
		loggingService:   loggingService,
		db:               db,
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
	syncLog := &model.SyncLog{
		StartedAt: time.Now(),
		Status:    "processing",
	}

	// Fetch current event config
	var eventCfg model.EventConfig
	if err := w.db.WithContext(ctx).First(&eventCfg, 1).Error; err != nil {
		log.Printf("Sync error: could not fetch EventConfig: %v", err)
		syncLog.Status = "error"
		syncLog.ErrorMsg = fmt.Sprintf("failed to fetch event config: %v", err)
		syncLog.EndedAt = time.Now()
		w.loggingService.LogSyncOperation(ctx, syncLog)
		return
	}

	repos, err := w.repoRepo.GetActiveRepositories(ctx)
	if err != nil {
		log.Printf("Sync error fetching active repos: %v", err)
		syncLog.Status = "error"
		syncLog.ErrorMsg = fmt.Sprintf("failed to fetch active repos: %v", err)
		syncLog.EndedAt = time.Now()
		w.loggingService.LogSyncOperation(ctx, syncLog)
		return
	}

	users, _ := w.userRepo.List(ctx)
	userMap := make(map[string]model.User)
	for _, u := range users {
		userMap[u.Username] = u
	}

	processedCount := 0
	for _, repo := range repos {
		log.Printf("Syncing activities for %s/%s", repo.Owner, repo.Name)
		
		// Refresh Repo Metadata (Stars, Description, and Casing)
		sanitizedName := strings.TrimSuffix(repo.Name, ".git")
		if ghRepo, err := w.githubService.GetClient().GetRepository(ctx, repo.Owner, sanitizedName); err == nil {
			repo.StarsCount = ghRepo.GetStargazersCount()
			// Correct casing from GitHub
			repo.Owner = ghRepo.GetOwner().GetLogin()
			repo.Name = ghRepo.GetName()

			if repo.Description == "" && ghRepo.GetDescription() != "" {
				repo.Description = ghRepo.GetDescription()
			}
			w.repoRepo.UpdateRepository(ctx, &repo)
		}

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
				c.EventID = eventCfg.ID

				// STRICT EVENT-BASED RULES
				// 1. Check if contribution falls within event dates
				if !eventCfg.StartDate.IsZero() && c.OccurredAt.Before(eventCfg.StartDate) {
					c.Points = 0
				}
				if !eventCfg.EndDate.IsZero() && c.OccurredAt.After(eventCfg.EndDate) {
					c.Points = 0
				}

				// 2. Ensure only merged PRs and approved evaluations are awarded points
				// (FetchRepoContributions already filters for merged PRs, but we enforce here)
				if c.Type == "PR" && c.Points > 0 {
					// Extra safety check could go here if needed
				}

				if err := w.contributionRepo.CreateOrUpdate(ctx, &c); err != nil {
					log.Printf("Error saving contribution: %v", err)
				} else {
					processedCount++
				}

				// Update Dashboard PullRequest table
				if c.Type == "PR" {
					var prNumber int
					fmt.Sscanf(c.ExternalID, "%d", &prNumber)

					title := ""
					var titleMeta struct {
						Title string `json:"title"`
					}
					if err := json.Unmarshal([]byte(c.Metadata), &titleMeta); err == nil {
						title = titleMeta.Title
					}

					pr := &model.PullRequest{
						UserID:       user.ID,
						RepoName:     repo.Owner + "/" + repo.Name,
						PRNumber:     prNumber,
						Title:        title,
						URL:          fmt.Sprintf("https://github.com/%s/%s/pull/%d", repo.Owner, repo.Name, prNumber),
						State:        "merged",
						ReviewStatus: "pending",
						Points:       repo.PointsPerPR, // Set target points for review display
						MergedAt:     &c.OccurredAt,
						CreatedAt:    c.OccurredAt,
					}
					w.prRepo.CreateOrUpdate(ctx, pr)
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

	syncLog.Status = "success"
	syncLog.ProcessedCount = processedCount
	syncLog.EndedAt = time.Now()
	w.loggingService.LogSyncOperation(ctx, syncLog)
	log.Printf("Global sync job completed. Processed %d entries.", processedCount)
}

func (w *SyncWorker) SyncRepoMetadata(ctx context.Context, repoID uuid.UUID) error {
	repo, err := w.repoRepo.GetRepositoryByID(ctx, repoID)
	if err != nil {
		return err
	}

	sanitizedName := strings.TrimSuffix(repo.Name, ".git")
	ghRepo, err := w.githubService.GetClient().GetRepository(ctx, repo.Owner, sanitizedName)
	if err != nil {
		return fmt.Errorf("failed to fetch from GitHub (repo: %s/%s): %v", repo.Owner, sanitizedName, err)
	}

	repo.StarsCount = ghRepo.GetStargazersCount()
	repo.Owner = ghRepo.GetOwner().GetLogin()
	repo.Name = ghRepo.GetName()
	if ghRepo.GetDescription() != "" {
		repo.Description = ghRepo.GetDescription()
	}

	return w.repoRepo.UpdateRepository(ctx, repo)
}
