package repository

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type FresherRepository interface {
	CreateApplication(ctx context.Context, app *model.FresherApplication) error
	ListApplications(ctx context.Context) ([]model.FresherApplication, error)
	UpdateStatus(ctx context.Context, id string, status string) error
}
