package repository

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type AuditLogRepository interface {
	Create(ctx context.Context, log *model.AuditLog) error
	List(ctx context.Context, limit, offset int) ([]model.AuditLog, error)
}
