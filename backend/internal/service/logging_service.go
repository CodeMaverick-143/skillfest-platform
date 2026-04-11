package service

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type LoggingService interface {
	LogAuditAction(ctx context.Context, log *model.AuditLog) error
	LogSyncOperation(ctx context.Context, log *model.SyncLog) error
	GetAuditLogs(ctx context.Context, limit, offset int) ([]model.AuditLog, error)
	GetSyncLogs(ctx context.Context, limit, offset int) ([]model.SyncLog, error)
}

type PostgresLoggingService struct {
	auditRepo repository.AuditLogRepository
	syncRepo  repository.SyncLogRepository
}

func NewPostgresLoggingService(auditRepo repository.AuditLogRepository, syncRepo repository.SyncLogRepository) *PostgresLoggingService {
	return &PostgresLoggingService{
		auditRepo: auditRepo,
		syncRepo:  syncRepo,
	}
}

func (s *PostgresLoggingService) LogAuditAction(ctx context.Context, log *model.AuditLog) error {
	return s.auditRepo.Create(ctx, log)
}

func (s *PostgresLoggingService) LogSyncOperation(ctx context.Context, log *model.SyncLog) error {
	return s.syncRepo.Create(ctx, log)
}

func (s *PostgresLoggingService) GetAuditLogs(ctx context.Context, limit, offset int) ([]model.AuditLog, error) {
	return s.auditRepo.List(ctx, limit, offset)
}

func (s *PostgresLoggingService) GetSyncLogs(ctx context.Context, limit, offset int) ([]model.SyncLog, error) {
	return s.syncRepo.List(ctx, limit, offset)
}
