package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	ID        string
	Owner     string
	Name      string
	IsActive  bool
}

func main() {
	_ = godotenv.Load(".env")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	var repos []Repository
	if err := db.Table("repositories").Find(&repos).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Println("--- REPOSITORIES IN DB ---")
	for _, r := range repos {
		fmt.Printf("ID: %s, Owner: %s, Name: %s, IsActive: %v\n", r.ID, r.Owner, r.Name, r.IsActive)
	}
	fmt.Println("--------------------------")
}
