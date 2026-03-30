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
		DoUpdates: clause.AssignmentColumns([]string{"state", "title", "points", "merged_at"}),
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
	// Efficiently join pull_requests with repositories to filter in SQL
	err := r.db.WithContext(ctx).
		Table("pull_requests").
		Select("pull_requests.*").
		Joins("JOIN repositories ON (pull_requests.repo_name = repositories.name OR pull_requests.repo_name = repositories.owner || '/' || repositories.name)").
		Where("pull_requests.user_id = ?", userID).
		Where("repositories.is_active = ?", true).
		Where("pull_requests.merged_at >= repositories.start_date").
		Where("pull_requests.merged_at <= repositories.end_date").
		Order("pull_requests.created_at desc").
		Find(&prs).Error
	return prs, err
}
