package model

import "time"

type FresherApplication struct {
	ID                string    `json:"id" db:"id"`
	UserID            string    `json:"user_id" db:"user_id"`
	PortfolioURL      string    `json:"portfolio_url" db:"portfolio_url"`
	ExperienceSummary string    `json:"experience_summary" db:"experience_summary"`
	Statement         string    `json:"statement" db:"statement"`
	Status            string    `json:"status" db:"status"` // Pending, Approved, Rejected
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}
