package model

import "time"

type PullRequest struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id"`
	RepoName    string    `json:"repo_name" db:"repo_name"`
	PRNumber    int       `json:"pr_number" db:"pr_number"`
	Title       string    `json:"title" db:"title"`
	URL         string    `json:"url" db:"url"`
	State       string    `json:"state" db:"state"` // open, merged, closed
	Difficulty  string    `json:"difficulty" db:"difficulty"`
	Points      int       `json:"points" db:"points"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	MergedAt    *time.Time `json:"merged_at,omitempty" db:"merged_at"`
}
