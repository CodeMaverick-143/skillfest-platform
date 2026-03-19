package postgres

import (
	"context"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(db *gorm.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Create(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *PostgresUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var u model.User
	err := r.db.WithContext(ctx).First(&u, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) GetByGitHubID(ctx context.Context, githubID string) (*model.User, error) {
	var u model.User
	err := r.db.WithContext(ctx).First(&u, "github_id = ?", githubID).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) UpdatePoints(ctx context.Context, userID uuid.UUID, points int, level string) error {
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"points": points,
		"level":  level,
	}).Error
}

func (r *PostgresUserRepository) GetLeaderboard(ctx context.Context, limit int) ([]model.User, error) {
	var users []model.User
	err := r.db.WithContext(ctx).Order("points desc").Limit(limit).Find(&users).Error
	return users, err
}
