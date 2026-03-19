package postgres

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type PostgresUserRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresUserRepository(pool *pgxpool.Pool) *PostgresUserRepository {
	return &PostgresUserRepository{pool: pool}
}

func (r *PostgresUserRepository) Create(ctx context.Context, user *model.User) error {
	query := `INSERT INTO users (github_id, username, email, points, level) 
	          VALUES ($1, $2, $3, $4, $5) 
	          RETURNING id, created_at, updated_at`
	return r.pool.QueryRow(ctx, query, user.GitHubID, user.Username, user.Email, user.Points, user.Level).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *PostgresUserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var u model.User
	query := `SELECT id, github_id, username, email, points, level, created_at, updated_at FROM users WHERE id = $1`
	err := r.pool.QueryRow(ctx, query, id).Scan(&u.ID, &u.GitHubID, &u.Username, &u.Email, &u.Points, &u.Level, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) GetByGitHubID(ctx context.Context, githubID string) (*model.User, error) {
	var u model.User
	query := `SELECT id, github_id, username, email, points, level, created_at, updated_at FROM users WHERE github_id = $1`
	err := r.pool.QueryRow(ctx, query, githubID).Scan(&u.ID, &u.GitHubID, &u.Username, &u.Email, &u.Points, &u.Level, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) UpdatePoints(ctx context.Context, userID string, points int, level string) error {
	query := `UPDATE users SET points = $1, level = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`
	_, err := r.pool.Exec(ctx, query, points, level, userID)
	return err
}

func (r *PostgresUserRepository) GetLeaderboard(ctx context.Context, limit int) ([]model.User, error) {
	query := `SELECT id, github_id, username, points, level FROM users ORDER BY points DESC LIMIT $1`
	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var u model.User
		if err := rows.Scan(&u.ID, &u.GitHubID, &u.Username, &u.Points, &u.Level); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
