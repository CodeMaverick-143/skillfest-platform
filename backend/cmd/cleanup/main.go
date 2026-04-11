package main

import (
	"log"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/config"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()
	db, err := repository.NewDBPool(nil, cfg)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	log.Println("Starting database cleanup...")

	// 1. Delete all PRs, Contributions, and Attempts
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.PullRequest{}).Error; err != nil {
		log.Printf("Error deleting PRs: %v", err)
	}
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.Contribution{}).Error; err != nil {
		log.Printf("Error deleting Contributions: %v", err)
	}
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.IssueAttempt{}).Error; err != nil {
		log.Printf("Error deleting IssueAttempts: %v", err)
	}
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.SyncLog{}).Error; err != nil {
		log.Printf("Error deleting SyncLogs: %v", err)
	}

	// 2. Delete non-admin users
	// We preserve users who have is_admin = true so the admin portal remains accessible.
	result := db.Where("is_admin = ?", false).Delete(&model.User{})
	if result.Error != nil {
		log.Printf("Error deleting non-admin users: %v", err)
	} else {
		log.Printf("Deleted %d mock users.", result.RowsAffected)
	}

	// 3. Reset admin points to 0 to be safe
	if err := db.Model(&model.User{}).Where("is_admin = ?", true).Updates(map[string]interface{}{
		"points": 0,
		"level": "Explorer",
	}).Error; err != nil {
		log.Printf("Error resetting admin points: %v", err)
	}

	log.Println("Cleanup complete. Real participants can now enroll.")
}
