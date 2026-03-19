package model

import "time"

type User struct {
	ID        string    `json:"id" db:"id"`
	GitHubID  string    `json:"github_id" db:"github_id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Points    int       `json:"points" db:"points"`
	Level     string    `json:"level" db:"level"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
