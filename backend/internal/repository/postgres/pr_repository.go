package postgres

import (
	"context"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresPRRepository struct {
	db *gorm.DB
}

func NewPostgresPRRepository(db *gorm.DB) *PostgresPRRepository {
	return &PostgresPRRepository{db: db}
}

func (r *PostgresPRRepository) CreateOrUpdate(ctx context.Context, pr *model.PullRequest) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "repo_name"}, {Name: "pr_number"}},
		DoUpdates: clause.AssignmentColumns([]string{"state", "title", "points", "merged_at", "review_status", "reviewed_by"}),
	}).Create(pr).Error
}

func (r *PostgresPRRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]model.PullRequest, error) {
	var prs []model.PullRequest
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at desc").Find(&prs).Error
	return prs, err
}

func (r *PostgresPRRepository) GetByRepoAndNumber(ctx context.Context, repo string, number int) (*model.PullRequest, error) {
	var pr model.PullRequest
	err := r.db.WithContext(ctx).Where("repo_name = ? AND pr_number = ?", repo, number).First(&pr).Error
	if err != nil {
		return nil, err
	}
	return &pr, nil
}

func (r *PostgresPRRepository) ListAll(ctx context.Context) ([]model.PullRequest, error) {
	var prs []model.PullRequest
	err := r.db.WithContext(ctx).Order("created_at desc").Find(&prs).Error
	return prs, err
}

func (r *PostgresPRRepository) GetFilteredByUser(ctx context.Context, userID uuid.UUID) ([]model.PullRequest, error) {
	var prs []model.PullRequest
	// Return all PRs for the user directly from the pull_requests table.
	// We no longer require a strict join with the repositories table for the personal log
	// to ensure visibility even if there are naming mismatches.
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&prs).Error
	return prs, err
}
