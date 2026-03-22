package postgres

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresRepoRepository struct {
	db *gorm.DB
}

func NewPostgresRepoRepository(db *gorm.DB) *PostgresRepoRepository {
	return &PostgresRepoRepository{db: db}
}

func (r *PostgresRepoRepository) CreateRepository(ctx context.Context, repo *model.Repository) error {
	return r.db.WithContext(ctx).Create(repo).Error
}

func (r *PostgresRepoRepository) ListRepositories(ctx context.Context) ([]model.Repository, error) {
	var repos []model.Repository
	err := r.db.WithContext(ctx).Order("created_at desc").Find(&repos).Error
	return repos, err
}

func (r *PostgresRepoRepository) DeleteRepository(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.Repository{}, id).Error
}

func (r *PostgresRepoRepository) GetActiveRepositories(ctx context.Context) ([]model.Repository, error) {
	var repos []model.Repository
	err := r.db.WithContext(ctx).Where("is_active = ?", true).Find(&repos).Error
	return repos, err
}

func (r *PostgresRepoRepository) GetRepositoryByID(ctx context.Context, id uuid.UUID) (*model.Repository, error) {
	var repo model.Repository
	err := r.db.WithContext(ctx).First(&repo, id).Error
	if err != nil {
		return nil, err
	}
	return &repo, nil
}

func (r *PostgresRepoRepository) CreateAttempt(ctx context.Context, attempt *model.IssueAttempt) error {
	return r.db.WithContext(ctx).Create(attempt).Error
}

func (r *PostgresRepoRepository) GetUserAttempts(ctx context.Context, userID uuid.UUID) ([]model.IssueAttempt, error) {
	var attempts []model.IssueAttempt
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&attempts).Error
	return attempts, err
}

func (r *PostgresRepoRepository) GetAttempt(ctx context.Context, userID uuid.UUID, repoID uuid.UUID, issueNumber int) (*model.IssueAttempt, error) {
	var attempt model.IssueAttempt
	err := r.db.WithContext(ctx).Where("user_id = ? AND repo_id = ? AND issue_number = ?", userID, repoID, issueNumber).First(&attempt).Error
	if err != nil {
		return nil, err
	}
	return &attempt, nil
}

func (r *PostgresRepoRepository) UpdateAttemptStatus(ctx context.Context, id uuid.UUID, status string) error {
	return r.db.WithContext(ctx).Model(&model.IssueAttempt{}).Where("id = ?", id).Update("status", status).Error
}
