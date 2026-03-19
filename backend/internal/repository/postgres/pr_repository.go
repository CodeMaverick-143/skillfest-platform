package postgres

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresPRRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresPRRepository(pool *pgxpool.Pool) *PostgresPRRepository {
	return &PostgresPRRepository{pool: pool}
}

func (r *PostgresPRRepository) CreateOrUpdate(ctx context.Context, pr *model.PullRequest) error {
	query := `INSERT INTO pull_requests (user_id, repo_name, pr_number, title, url, state, difficulty, points, merged_at) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
	          ON CONFLICT (repo_name, pr_number) DO UPDATE SET 
	          state = EXCLUDED.state, title = EXCLUDED.title, points = EXCLUDED.points, merged_at = EXCLUDED.merged_at
	          RETURNING id, created_at`
	return r.pool.QueryRow(ctx, query, pr.UserID, pr.RepoName, pr.PRNumber, pr.Title, pr.URL, pr.State, pr.Difficulty, pr.Points, pr.MergedAt).
		Scan(&pr.ID, &pr.CreatedAt)
}

func (r *PostgresPRRepository) GetByUserID(ctx context.Context, userID string) ([]model.PullRequest, error) {
	query := `SELECT id, user_id, repo_name, pr_number, title, url, state, difficulty, points, created_at, merged_at 
	          FROM pull_requests WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prs []model.PullRequest
	for rows.Next() {
		var pr model.PullRequest
		if err := rows.Scan(&pr.ID, &pr.UserID, &pr.RepoName, &pr.PRNumber, &pr.Title, &pr.URL, &pr.State, &pr.Difficulty, &pr.Points, &pr.CreatedAt, &pr.MergedAt); err != nil {
			return nil, err
		}
		prs = append(prs, pr)
	}
	return prs, nil
}

func (r *PostgresPRRepository) GetByRepoAndNumber(ctx context.Context, repo string, number int) (*model.PullRequest, error) {
	var pr model.PullRequest
	query := `SELECT id, user_id, repo_name, pr_number, title, url, state, difficulty, points, created_at, merged_at 
	          FROM pull_requests WHERE repo_name = $1 AND pr_number = $2`
	err := r.pool.QueryRow(ctx, query, repo, number).Scan(&pr.ID, &pr.UserID, &pr.RepoName, &pr.PRNumber, &pr.Title, &pr.URL, &pr.State, &pr.Difficulty, &pr.Points, &pr.CreatedAt, &pr.MergedAt)
	if err != nil {
		return nil, err
	}
	return &pr, nil
}
