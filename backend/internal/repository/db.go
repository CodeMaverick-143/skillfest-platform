package repository

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/config"
)

func NewDBPool(ctx context.Context, cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		PrepareStmt:            false,
		SkipDefaultTransaction: true,
		Logger:                 logger.Default.LogMode(logger.Warn), // Only log warnings/errors to reduce noise
	})
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("unable to get underlying sql.DB: %v", err)
	}

	// Connection Pool Tuning
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("unable to ping database: %v", err)
	}

	log.Println("Connected to NeonDB via GORM with performance optimizations")
	return db, nil
}
