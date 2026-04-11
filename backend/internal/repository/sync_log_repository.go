package repository

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type SyncLogRepository interface {
	Create(ctx context.Context, log *model.SyncLog) error
	List(ctx context.Context, limit, offset int) ([]model.SyncLog, error)
	GetLast(ctx context.Context) (*model.SyncLog, error)
}
