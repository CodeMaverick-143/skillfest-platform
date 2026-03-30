package repository

import (
	"context"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/google/uuid"
)

type EvaluationRepository interface {
	// Rubric management
	UpsertRubric(ctx context.Context, rubric *model.EvaluationRubric) error
	GetRubricByRepoID(ctx context.Context, repoID uuid.UUID) (*model.EvaluationRubric, error)
	GetGlobalRubric(ctx context.Context) (*model.EvaluationRubric, error)
	ListRubrics(ctx context.Context) ([]model.EvaluationRubric, error)
	DeleteRubric(ctx context.Context, id uuid.UUID) error

	// Evaluation management
	UpsertEvaluation(ctx context.Context, eval *model.ProjectEvaluation) error
	GetEvaluationByUserAndRepo(ctx context.Context, userID uuid.UUID, repoID *uuid.UUID) (*model.ProjectEvaluation, error)
	GetEvaluationByID(ctx context.Context, id uuid.UUID) (*model.ProjectEvaluation, error)
	ListEvaluations(ctx context.Context) ([]model.ProjectEvaluation, error)
	ListEvaluationsByUser(ctx context.Context, userID uuid.UUID) ([]model.ProjectEvaluation, error)
	SubmitEvaluation(ctx context.Context, id uuid.UUID, reviewedBy string) (*model.ProjectEvaluation, error)
}
