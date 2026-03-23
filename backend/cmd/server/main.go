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

	// AutoMigrate models
	if err := pool.AutoMigrate(&model.User{}, &model.PullRequest{}, &model.FresherApplication{}, &model.Repository{}, &model.IssueAttempt{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	sqlDB, _ := pool.DB()
	defer sqlDB.Close()

	// 2. Initialize Repositories
	userRepo := postgres.NewPostgresUserRepository(pool)
	prRepo := postgres.NewPostgresPRRepository(pool)
	fresherRepo := postgres.NewPostgresFresherRepository(pool)
	repoRepo := postgres.NewPostgresRepoRepository(pool)

	// 3. Initialize Services
	ghToken := os.Getenv("GITHUB_SYSTEM_TOKEN")
	ghClient := github.NewClient(ctx, ghToken)
	ghService := service.NewGitHubService(ghClient)
	authService := service.NewAuthService(cfg, userRepo)
	pointsService := service.NewPointsService(userRepo, prRepo)
	adminService := service.NewAdminService(fresherRepo)

	// 4. Start Background Worker
	syncWorker := service.NewSyncWorker(userRepo, ghService, prRepo, pointsService)
	go syncWorker.Start(ctx, 30*time.Minute)

	// 5. Setup Server
	srv := api.NewServer(cfg, userRepo, prRepo, repoRepo, authService, adminService, ghService, syncWorker)
	log.Printf("Starting SkillFest Platform Backend on port %s...", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, srv.Router()); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
