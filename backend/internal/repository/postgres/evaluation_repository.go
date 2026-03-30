package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PostgresEvaluationRepository struct {
	db *gorm.DB
}

func NewPostgresEvaluationRepository(db *gorm.DB) *PostgresEvaluationRepository {
	return &PostgresEvaluationRepository{db: db}
}

// ─── Rubric ────────────────────────────────────────────────────────────────

func (r *PostgresEvaluationRepository) UpsertRubric(ctx context.Context, rubric *model.EvaluationRubric) error {
	return r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "repo_id"}},
			DoUpdates: clause.AssignmentColumns([]string{"name", "categories", "updated_at"}),
		}).
		Create(rubric).Error
}

func (r *PostgresEvaluationRepository) GetRubricByRepoID(ctx context.Context, repoID uuid.UUID) (*model.EvaluationRubric, error) {
	var rubric model.EvaluationRubric
	err := r.db.WithContext(ctx).Where("repo_id = ?", repoID).First(&rubric).Error
	if err != nil {
		return nil, err
	}
	return &rubric, nil
}

func (r *PostgresEvaluationRepository) GetGlobalRubric(ctx context.Context) (*model.EvaluationRubric, error) {
	var rubric model.EvaluationRubric
	err := r.db.WithContext(ctx).Where("repo_id IS NULL").First(&rubric).Error
	if err != nil {
		return nil, err
	}
	return &rubric, nil
}

func (r *PostgresEvaluationRepository) ListRubrics(ctx context.Context) ([]model.EvaluationRubric, error) {
	var rubrics []model.EvaluationRubric
	err := r.db.WithContext(ctx).Order("created_at desc").Find(&rubrics).Error
	return rubrics, err
}

func (r *PostgresEvaluationRepository) DeleteRubric(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.EvaluationRubric{}, id).Error
}

// ─── Evaluation ────────────────────────────────────────────────────────────

func (r *PostgresEvaluationRepository) UpsertEvaluation(ctx context.Context, eval *model.ProjectEvaluation) error {
	// Check if one already exists
	var existing model.ProjectEvaluation
	query := r.db.WithContext(ctx).Where("user_id = ?", eval.UserID)
	if eval.RepoID != nil {
		query = query.Where("repo_id = ?", eval.RepoID)
	} else {
		query = query.Where("repo_id IS NULL")
	}

	err := query.First(&existing).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create
		return r.db.WithContext(ctx).Create(eval).Error
	}

	// Update existing (do not allow re-submitting an already-reviewed evaluation)
	if existing.Reviewed && eval.Reviewed {
		return errors.New("evaluation already submitted and locked")
	}

	eval.ID = existing.ID
	eval.CreatedAt = existing.CreatedAt
	return r.db.WithContext(ctx).Save(eval).Error
}

func (r *PostgresEvaluationRepository) GetEvaluationByUserAndRepo(ctx context.Context, userID uuid.UUID, repoID *uuid.UUID) (*model.ProjectEvaluation, error) {
	var eval model.ProjectEvaluation
	query := r.db.WithContext(ctx).Where("user_id = ?", userID)
	if repoID != nil {
		query = query.Where("repo_id = ?", repoID)
	} else {
		query = query.Where("repo_id IS NULL")
	}
	err := query.First(&eval).Error
	if err != nil {
		return nil, err
	}
	return &eval, nil
}

func (r *PostgresEvaluationRepository) GetEvaluationByID(ctx context.Context, id uuid.UUID) (*model.ProjectEvaluation, error) {
	var eval model.ProjectEvaluation
	err := r.db.WithContext(ctx).First(&eval, id).Error
	if err != nil {
		return nil, err
	}
	return &eval, nil
}

func (r *PostgresEvaluationRepository) ListEvaluations(ctx context.Context) ([]model.ProjectEvaluation, error) {
	var evals []model.ProjectEvaluation
	err := r.db.WithContext(ctx).Order("updated_at desc").Find(&evals).Error
	return evals, err
}

func (r *PostgresEvaluationRepository) ListEvaluationsByUser(ctx context.Context, userID uuid.UUID) ([]model.ProjectEvaluation, error) {
	var evals []model.ProjectEvaluation
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("updated_at desc").Find(&evals).Error
	return evals, err
}

// SubmitEvaluation finalizes the evaluation, marks it as reviewed, and returns the total points to credit.
func (r *PostgresEvaluationRepository) SubmitEvaluation(ctx context.Context, id uuid.UUID, reviewedBy string) (*model.ProjectEvaluation, error) {
	var eval model.ProjectEvaluation
	if err := r.db.WithContext(ctx).First(&eval, id).Error; err != nil {
		return nil, err
	}
	if eval.Reviewed {
		return nil, errors.New("evaluation already submitted")
	}
	now := time.Now()
	eval.Reviewed = true
	eval.ReviewedBy = reviewedBy
	eval.SubmittedAt = &now
	if err := r.db.WithContext(ctx).Save(&eval).Error; err != nil {
		return nil, err
	}
	return &eval, nil
}
