package postgres

import (
	"context"
	"gorm.io/gorm"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresSyncLogRepository struct {
	db *gorm.DB
}

func NewPostgresSyncLogRepository(db *gorm.DB) *PostgresSyncLogRepository {
	return &PostgresSyncLogRepository{db: db}
}

func (r *PostgresSyncLogRepository) Create(ctx context.Context, log *model.SyncLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *PostgresSyncLogRepository) List(ctx context.Context, limit, offset int) ([]model.SyncLog, error) {
	var logs []model.SyncLog
	err := r.db.WithContext(ctx).Order("started_at desc").Limit(limit).Offset(offset).Find(&logs).Error
	return logs, err
}

func (r *PostgresSyncLogRepository) GetLast(ctx context.Context) (*model.SyncLog, error) {
	var log model.SyncLog
	err := r.db.WithContext(ctx).Order("started_at desc").First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}
