package model

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GitHubID    string    `gorm:"column:github_id;uniqueIndex;not null" json:"github_id"`
	Username    string    `gorm:"uniqueIndex;not null" json:"username"`
	Email       string    `json:"email"`
	AvatarURL   string    `json:"avatar_url"`
	Points      int       `gorm:"default:0" json:"points"`
	Level       string    `gorm:"default:'Newcomer'" json:"level"`
	GitHubToken string    `gorm:"column:github_token" json:"github_token"`
	IsEnrolled  bool      `gorm:"default:false" json:"is_enrolled"`
	IsHidden    bool      `gorm:"default:false" json:"is_hidden"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

type PullRequest struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	RepoName    string     `gorm:"uniqueIndex:idx_repo_pr;not null" json:"repo_name"`
	PRNumber    int        `gorm:"uniqueIndex:idx_repo_pr;not null" json:"pr_number"`
	Title       string     `json:"title"`
	URL         string     `gorm:"uniqueIndex;not null" json:"url"`
	State       string     `gorm:"not null" json:"state"`
	Difficulty  string     `json:"difficulty"`
	Labels      string     `json:"labels"` // Comma-separated labels
	IsOrg       bool       `gorm:"default:false" json:"is_org"`
	Points      int        `gorm:"default:0" json:"points"`
	CreatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	MergedAt    *time.Time `json:"merged_at,omitempty"`
}

type FresherApplication struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User              User      `gorm:"foreignKey:UserID" json:"user"`
	PortfolioURL      string    `json:"portfolio_url"`
	ExperienceSummary string    `json:"experience_summary"`
	Statement         string    `json:"statement"`
	Status            string    `gorm:"default:'Pending'" json:"status"`
	CreatedAt         time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt         time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

func (pr *PullRequest) BeforeCreate(tx *gorm.DB) (err error) {
	if pr.ID == uuid.Nil {
		pr.ID = uuid.New()
	}
	return
}

func (app *FresherApplication) BeforeCreate(tx *gorm.DB) (err error) {
	if app.ID == uuid.Nil {
		app.ID = uuid.New()
	}
	return
}
