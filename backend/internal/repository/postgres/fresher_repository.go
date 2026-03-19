package postgres

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresFresherRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresFresherRepository(pool *pgxpool.Pool) *PostgresFresherRepository {
	return &PostgresFresherRepository{pool: pool}
}

func (r *PostgresFresherRepository) CreateApplication(ctx context.Context, app *model.FresherApplication) error {
	query := `INSERT INTO fresher_applications (user_id, portfolio_url, experience_summary, statement) 
	          VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at`
	return r.pool.QueryRow(ctx, query, app.UserID, app.PortfolioURL, app.ExperienceSummary, app.Statement).
		Scan(&app.ID, &app.CreatedAt, &app.UpdatedAt)
}

func (r *PostgresFresherRepository) ListApplications(ctx context.Context) ([]model.FresherApplication, error) {
	query := `SELECT id, user_id, portfolio_url, experience_summary, statement, status, created_at, updated_at 
	          FROM fresher_applications ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apps []model.FresherApplication
	for rows.Next() {
		var a model.FresherApplication
		if err := rows.Scan(&a.ID, &a.UserID, &a.PortfolioURL, &a.ExperienceSummary, &a.Statement, &a.Status, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		apps = append(apps, a)
	}
	return apps, nil
}

func (r *PostgresFresherRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE fresher_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, status, id)
	return err
}
