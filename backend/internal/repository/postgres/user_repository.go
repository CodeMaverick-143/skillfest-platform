package postgres

import (
	"context"
	"time"
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

func (r *PostgresUserRepository) UpdatePoints(ctx context.Context, userID uuid.UUID, points int, level string, lastScoreUpdatedAt time.Time) error {
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"points":                  points,
		"level":                   level,
		"last_score_updated_at": lastScoreUpdatedAt,
	}).Error
}

func (r *PostgresUserRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var u model.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) Update(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *PostgresUserRepository) GetLeaderboard(ctx context.Context, limit int) ([]model.User, error) {
	var users []model.User
	err := r.db.WithContext(ctx).Where("is_hidden = ? AND is_banned = ?", false, false).Order("points desc, last_score_updated_at asc, id asc").Limit(limit).Find(&users).Error
	return users, err
}

func (r *PostgresUserRepository) List(ctx context.Context) ([]model.User, error) {
	var users []model.User
	err := r.db.WithContext(ctx).Order("points desc, last_score_updated_at asc, id asc").Find(&users).Error
	return users, err
}

func (r *PostgresUserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var u model.User
	err := r.db.WithContext(ctx).First(&u, "email = ?", email).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}
