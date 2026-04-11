package postgres

import (
	"context"
	"gorm.io/gorm"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresAuditLogRepository struct {
	db *gorm.DB
}

func NewPostgresAuditLogRepository(db *gorm.DB) *PostgresAuditLogRepository {
	return &PostgresAuditLogRepository{db: db}
}

func (r *PostgresAuditLogRepository) Create(ctx context.Context, log *model.AuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *PostgresAuditLogRepository) List(ctx context.Context, limit, offset int) ([]model.AuditLog, error) {
	var logs []model.AuditLog
	err := r.db.WithContext(ctx).Order("created_at desc").Limit(limit).Offset(offset).Find(&logs).Error
	return logs, err
}
