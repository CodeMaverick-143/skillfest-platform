package model

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// EventConfig is a singleton row controlling global event lifecycle.
type EventConfig struct {
	ID               uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	IsEventActive    bool      `gorm:"default:true" json:"is_event_active"`
	StartDate        time.Time `gorm:"default:null" json:"start_date"`
	EndDate          time.Time `gorm:"default:null" json:"end_date"`
	EventTitle       string    `gorm:"default:'SkillFest 2026'" json:"event_title"`
	EventDescription string    `gorm:"default:''" json:"event_description"`
	UpdatedAt        time.Time `json:"updated_at"`
	UpdatedBy        string    `json:"updated_by"`
}

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GitHubID    string    `gorm:"column:github_id;uniqueIndex;not null" json:"github_id"`
	Username    string    `gorm:"uniqueIndex;not null" json:"username"`
	Email       string    `json:"email"`
	AvatarURL   string    `json:"avatar_url"`
	Points      int       `gorm:"default:0;index;index:idx_user_status_points" json:"points"`
	Level       string    `gorm:"default:'Newcomer'" json:"level"`
	GitHubToken string    `gorm:"column:github_token" json:"github_token"`
	IsEnrolled  bool      `gorm:"default:false" json:"is_enrolled"`
	IsHidden    bool      `gorm:"default:false;index:idx_user_status_points" json:"is_hidden"`
	IsAdmin     bool      `gorm:"default:false" json:"is_admin"`
	IsBanned    bool      `gorm:"default:false;index:idx_user_status_points" json:"is_banned"`
	Attempts    []IssueAttempt `gorm:"foreignKey:UserID" json:"attempts,omitempty"`
	LastScoreUpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"last_score_updated_at"`
	IsReviewer  bool      `gorm:"default:false" json:"is_reviewer"` // For RBAC
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}
func (u *User) CalculateLevel() string {
	points := u.Points
	switch {
	case points >= 100000:
		return "Elite"
	case points >= 50000:
		return "Lead"
	case points >= 25000:
		return "Core"
	case points >= 10000:
		return "Maintainer"
	case points >= 2500:
		return "Builder"
	case points >= 1000:
		return "Contributor"
	default:
		return "Explorer"
	}
}

type PullRequest struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	RepoName    string     `gorm:"uniqueIndex:idx_repo_pr;not null" json:"repo_name"`
	PRNumber    int        `gorm:"uniqueIndex:idx_repo_pr;not null" json:"pr_number"`
	Title       string     `json:"title"`
	URL         string     `gorm:"uniqueIndex;not null" json:"url"`
	State       string     `gorm:"not null" json:"state"`
	Difficulty  string     `json:"difficulty"`
	Labels      string     `json:"labels"` // Comma-separated labels
	IsOrg       bool       `gorm:"default:false" json:"is_org"`
	Points      int        `gorm:"default:0" json:"points"`
	CreatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP;index" json:"created_at"`
	MergedAt    *time.Time `gorm:"index" json:"merged_at,omitempty"`
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

type Repository struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Owner       string    `gorm:"uniqueIndex:idx_owner_repo;not null" json:"owner"`
	Name        string    `gorm:"uniqueIndex:idx_owner_repo;not null" json:"name"`
	URL         string    `json:"url"`
	OrgName     string    `json:"org_name"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	IsActive    bool      `gorm:"default:true;index" json:"is_active"`
	PointsPerPR int       `gorm:"default:25" json:"points_per_pr"` // Points awarded for a merged pull request
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP;index" json:"created_at"`
}

type Contribution struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	RepoID      uuid.UUID `gorm:"type:uuid;not null;index" json:"repo_id"`
	EventID     uint      `gorm:"index;not null;default:1" json:"event_id"` // Tied to EventConfig ID
	Type        string    `json:"type"` // PR, Commit, Issue, Merge, Reversal
	ExternalID  string    `gorm:"uniqueIndex:idx_cont_ext;not null" json:"external_id"` // PR number, commit SHA, etc.
	Points      int       `json:"points"`
	OccurredAt  time.Time `gorm:"index" json:"occurred_at"`
	Metadata    string    `gorm:"type:text" json:"metadata"` // JSON string
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP;index" json:"created_at"`
}

type LeaderboardEntry struct {
	UserID uuid.UUID `json:"user_id"`
	Points int       `json:"points"`
}

type IssueAttempt struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	RepoID      uuid.UUID `gorm:"type:uuid;not null" json:"repo_id"`
	IssueNumber int       `gorm:"not null" json:"issue_number"`
	Status      string    `gorm:"default:'Attempting'" json:"status"` // Attempting, Submitted, Solved
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// EvaluationRubric defines custom scoring categories per repository.
// If RepoID is nil, this is the global default rubric.
type EvaluationRubric struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	RepoID     *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"repo_id,omitempty"` // nil = global default
	Name       string     `gorm:"not null;default:'Default Rubric'" json:"name"`
	Categories string     `gorm:"type:text;not null" json:"categories"` // JSON: [{"key":"code_quality","label":"Code Quality","max_score":30,"description":"..."},...]
	CreatedAt  time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// ProjectEvaluation is a manual admin review of a user's contributions in a repository.
type ProjectEvaluation struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:idx_eval_user_repo" json:"user_id"`
	RepoID      *uuid.UUID `gorm:"type:uuid;uniqueIndex:idx_eval_user_repo" json:"repo_id,omitempty"`
	RubricID    uuid.UUID  `gorm:"type:uuid;not null" json:"rubric_id"`
	Scores      string     `gorm:"type:text" json:"scores"`       // JSON: {"code_quality":25,"impact":20,...}
	Notes       string     `gorm:"type:text" json:"notes"`        // JSON: {"code_quality":"Great work", ...}
	TotalPoints int        `gorm:"default:0" json:"total_points"`
	Reviewed    bool       `gorm:"default:false;index" json:"reviewed"`
	ReviewedBy  string     `json:"reviewed_by"` // admin GitHub username
	SubmittedAt *time.Time `json:"submitted_at,omitempty"`
	CreatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// AuditLog tracks administrative actions.
type AuditLog struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AdminID   uuid.UUID `gorm:"type:uuid;not null;index" json:"admin_id"`
	Action    string    `gorm:"not null;index" json:"action"`
	TargetID  string    `gorm:"index" json:"target_id"` // User ID, Repo ID, etc.
	OldValue  string    `gorm:"type:text" json:"old_value"`
	NewValue  string    `gorm:"type:text" json:"new_value"`
	Reason    string    `gorm:"type:text" json:"reason"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP;index" json:"created_at"`
}

// SyncLog tracks repository synchronization operations.
type SyncLog struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Status         string    `json:"status"` // success, error, partially_completed
	ProcessedCount int       `json:"processed_count"`
	ErrorMsg       string    `gorm:"type:text" json:"error_msg"`
	StartedAt      time.Time `json:"started_at"`
	EndedAt        time.Time `json:"ended_at"`
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

func (r *Repository) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return
}

func (c *Contribution) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

func (ia *IssueAttempt) BeforeCreate(tx *gorm.DB) (err error) {
	if ia.ID == uuid.Nil {
		ia.ID = uuid.New()
	}
	return
}

func (er *EvaluationRubric) BeforeCreate(tx *gorm.DB) (err error) {
	if er.ID == uuid.Nil {
		er.ID = uuid.New()
	}
	return
}

func (pe *ProjectEvaluation) BeforeCreate(tx *gorm.DB) (err error) {
	if pe.ID == uuid.Nil {
		pe.ID = uuid.New()
	}
	return
}

func (al *AuditLog) BeforeCreate(tx *gorm.DB) (err error) {
	if al.ID == uuid.Nil {
		al.ID = uuid.New()
	}
	return
}

func (sl *SyncLog) BeforeCreate(tx *gorm.DB) (err error) {
	if sl.ID == uuid.Nil {
		sl.ID = uuid.New()
	}
	return
}
