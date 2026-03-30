package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/api"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/config"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository/postgres"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/service"
	"github.com/CodeMaverick-143/skillfest-platform/backend/pkg/github"
)

func main() {
	ctx := context.Background()
	cfg := config.LoadConfig()

	// 1. Setup Database
	pool, err := repository.NewDBPool(ctx, cfg)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	// AutoMigrate models (Optional: Skip in production to reduce startup time)
	if os.Getenv("SKIP_DB_MIGRATION") != "true" {
		if err := pool.AutoMigrate(
			&model.User{},
			&model.PullRequest{},
			&model.FresherApplication{},
			&model.Repository{},
			&model.IssueAttempt{},
			&model.Contribution{},
			&model.EvaluationRubric{},
			&model.ProjectEvaluation{},
			&model.EventConfig{},
		); err != nil {
			log.Fatalf("Failed to migrate database: %v", err)
		}

		// Seed default EventConfig singleton (ID=1) if not present
		var eventCfg model.EventConfig
		if result := pool.First(&eventCfg, 1); result.Error != nil {
			defaultCfg := model.EventConfig{ID: 1, IsEventActive: true}
			if err := pool.Create(&defaultCfg).Error; err != nil {
				log.Printf("Warning: could not seed EventConfig: %v", err)
			} else {
				log.Println("EventConfig seeded: event is ACTIVE by default")
			}
		}
	}

	sqlDB, _ := pool.DB()
	defer sqlDB.Close()

	// 2. Initialize Repositories
	userRepo := postgres.NewPostgresUserRepository(pool)
	prRepo := postgres.NewPostgresPRRepository(pool)
	fresherRepo := postgres.NewPostgresFresherRepository(pool)
	repoRepo := postgres.NewPostgresRepoRepository(pool)
	contributionRepo := postgres.NewPostgresContributionRepository(pool)
	evaluationRepo := postgres.NewPostgresEvaluationRepository(pool)

	// 3. Initialize Services
	ghToken := os.Getenv("GITHUB_SYSTEM_TOKEN")
	ghClient := github.NewClient(ctx, ghToken)
	ghService := service.NewGitHubService(ghClient)
	authService := service.NewAuthService(cfg, userRepo)
	// Admin Advanced Services
	cache := service.NewRedisCacheService(ctx, cfg.RedisURL)
	if cache == nil {
		log.Println("Redis not reachable, caching disabled for this session")
	} else {
		log.Println("Redis connected and caching enabled")
	}
	logger, _ := service.NewMongoLoggingService(cfg.MongoDBURI)

	pointsService := service.NewPointsService(userRepo, prRepo, repoRepo)
	adminService := service.NewAdminService(fresherRepo, userRepo, prRepo, contributionRepo, repoRepo)
	analyticsService := service.NewAnalyticsService(contributionRepo, cache)

	// 4. Start Background Worker
	syncWorker := service.NewSyncWorker(userRepo, ghService, contributionRepo, repoRepo, pointsService)
	go syncWorker.Start(ctx, 30*time.Minute)

	// 5. Setup Server — pass pool so event handlers can access EventConfig
	srv := api.NewServer(cfg, pool, userRepo, prRepo, repoRepo, contributionRepo, authService, adminService, ghService, syncWorker, logger, cache, analyticsService, evaluationRepo)
	log.Printf("Starting SkillFest Platform Backend on port %s...", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, srv.Router()); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
