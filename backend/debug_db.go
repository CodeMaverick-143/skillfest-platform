package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	godotenv.Load()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=skillfest port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	var user model.User
	db.Where("username = ?", "CodeMaverick-143").First(&user)
	fmt.Printf("--- User: %s (ID: %s) ---\n", user.Username, user.ID)

	var repos []model.Repository
	db.Find(&repos)

	fmt.Println("\n--- Repositories ---")
	for _, r := range repos {
		fmt.Printf("ID: %s | Name: %s | Active: %v\n", r.ID, r.Name, r.IsActive)
	}

	var prs []model.PullRequest
	db.Where("user_id = ?", user.ID).Find(&prs)
	fmt.Println("\n--- PRs for this User ---")
	for _, pr := range prs {
		fmt.Printf("Number: %d | Repo: %s | State: %s | MergedAt: %v | Points: %d\n", pr.PRNumber, pr.RepoName, pr.State, pr.MergedAt, pr.Points)
	}

	var allPRs []model.PullRequest
	db.Find(&allPRs)
	fmt.Println("\n--- ALL PRs in DB ---")
	for _, pr := range allPRs {
		fmt.Printf("Number: %d | Repo: %s | UserID: %s | State: %s\n", pr.PRNumber, pr.RepoName, pr.UserID, pr.State)
	}
}
