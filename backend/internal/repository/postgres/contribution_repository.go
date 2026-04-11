package postgres

import (
	"context"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PostgresContributionRepository struct {
	db *gorm.DB
}

func NewPostgresContributionRepository(db *gorm.DB) *PostgresContributionRepository {
	return &PostgresContributionRepository{db: db}
}

func (r *PostgresContributionRepository) CreateOrUpdate(ctx context.Context, c *model.Contribution) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	// Use OnConflict to handle idempotency based on ExternalID
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "external_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"points", "type", "metadata", "occurred_at"}),
	}).Create(c).Error
}

func (r *PostgresContributionRepository) ListByUser(ctx context.Context, userID uuid.UUID) ([]model.Contribution, error) {
	var contributions []model.Contribution
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&contributions).Error
	return contributions, err
}

func (r *PostgresContributionRepository) ListByRepo(ctx context.Context, repoID uuid.UUID) ([]model.Contribution, error) {
	var contributions []model.Contribution
	err := r.db.WithContext(ctx).Where("repo_id = ?", repoID).Find(&contributions).Error
	return contributions, err
}

func (r *PostgresContributionRepository) GetUserAnalytics(ctx context.Context, userID uuid.UUID, since, until time.Time) ([]model.Contribution, error) {
	var contributions []model.Contribution
	err := r.db.WithContext(ctx).Where("user_id = ? AND occurred_at BETWEEN ? AND ?", userID, since, until).Find(&contributions).Error
	return contributions, err
}

func (r *PostgresContributionRepository) GetFilteredByUser(ctx context.Context, userID uuid.UUID) ([]model.Contribution, error) {
	var contributions []model.Contribution
	err := r.db.WithContext(ctx).
		Table("contributions").
		Select("contributions.*").
		Joins("JOIN repositories ON contributions.repo_id = repositories.id").
		Where("contributions.user_id = ?", userID).
		Where("repositories.is_active = ?", true).
		Where("contributions.occurred_at >= repositories.start_date").
		Where("contributions.occurred_at <= repositories.end_date").
		Order("contributions.occurred_at desc").
		Find(&contributions).Error
	return contributions, err
}

func (r *PostgresContributionRepository) GetLeaderboardByEvent(ctx context.Context, eventID uint) ([]model.LeaderboardEntry, error) {
	var results []model.LeaderboardEntry
	err := r.db.WithContext(ctx).Model(&model.Contribution{}).
		Select("user_id, sum(points) as points").
		Where("event_id = ?", eventID).
		Group("user_id").
		Order("points desc").
		Scan(&results).Error
	return results, err
}

func (r *PostgresContributionRepository) GetLeaderboard(ctx context.Context, since, until time.Time) ([]model.LeaderboardEntry, error) {
	var results []model.LeaderboardEntry
	err := r.db.WithContext(ctx).Model(&model.Contribution{}).
		Select("user_id, sum(points) as points").
		Where("occurred_at BETWEEN ? AND ?", since, until).
		Group("user_id").
		Order("points desc, max(occurred_at) asc").
		Scan(&results).Error
	return results, err
}
