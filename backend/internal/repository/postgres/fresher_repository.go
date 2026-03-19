package postgres

import (
	"context"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresFresherRepository struct {
	db *gorm.DB
}

func NewPostgresFresherRepository(db *gorm.DB) *PostgresFresherRepository {
	return &PostgresFresherRepository{db: db}
}

func (r *PostgresFresherRepository) CreateApplication(ctx context.Context, app *model.FresherApplication) error {
	return r.db.WithContext(ctx).Create(app).Error
}

func (r *PostgresFresherRepository) ListApplications(ctx context.Context) ([]model.FresherApplication, error) {
	var apps []model.FresherApplication
	err := r.db.WithContext(ctx).Preload("User").Order("created_at desc").Find(&apps).Error
	return apps, err
}

func (r *PostgresFresherRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	return r.db.WithContext(ctx).Model(&model.FresherApplication{}).Where("id = ?", id).Update("status", status).Error
}
