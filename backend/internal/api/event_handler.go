package api

import (
	"net/http"
	"strings"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/gin-gonic/gin"
)

// ── helpers ──────────────────────────────────────────────────────────────────

// eventPhase returns "coming_soon" | "active" | "ended" based on stored dates.
// If dates are zero the caller should fall back to is_event_active.
func eventPhase(cfg model.EventConfig) string {
	now := time.Now()
	zero := time.Time{}
	if cfg.StartDate == zero || cfg.EndDate == zero {
		return "" // no dates set → use is_event_active flag
	}
	if now.Before(cfg.StartDate) {
		return "coming_soon"
	}
	if now.After(cfg.EndDate) {
		return "ended"
	}
	return "active"
}

// getOrCreateConfig fetches or seeds the singleton row (ID=1).
func (s *Server) getOrCreateConfig() (model.EventConfig, error) {
	var cfg model.EventConfig
	result := s.db.First(&cfg, 1)
	if result.Error != nil {
		// Seed default
		cfg = model.EventConfig{
			ID:            1,
			IsEventActive: true,
			EventTitle:    "SkillFest 2026",
		}
		if err := s.db.Create(&cfg).Error; err != nil {
			return cfg, err
		}
	}
	return cfg, nil
}

// ── GET /api/event/status ─────────────────────────────────────────────────────

// getEventStatus returns the full event configuration — phase, dates, title, real stats.
// This is public; the frontend uses it for all conditional rendering.
func (s *Server) getEventStatus(c *gin.Context) {
	cfg, err := s.getOrCreateConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load event config"})
		return
	}

	// Compute derived phase from dates (fallback to is_event_active flag)
	phase := eventPhase(cfg)
	if phase == "" {
		if cfg.IsEventActive {
			phase = "active"
		} else {
			phase = "ended"
		}
	}

	// Real stats from DB — counts only, fast queries
	var totalUsers int64
	s.db.Model(&model.User{}).Count(&totalUsers)

	var totalPRs int64
	s.db.Model(&model.PullRequest{}).Count(&totalPRs)

	var mergedPRs int64
	s.db.Model(&model.PullRequest{}).Where("state = ?", "merged").Count(&mergedPRs)

	var activeRepos int64
	s.db.Model(&model.Repository{}).Where("is_active = ?", true).Count(&activeRepos)

	c.JSON(http.StatusOK, gin.H{
		// Phase for conditional rendering
		"phase":          phase,
		"is_event_active": cfg.IsEventActive,

		// Dates (zero-time returned as null-equivalent)
		"start_date": nullableTime(cfg.StartDate),
		"end_date":   nullableTime(cfg.EndDate),

		// Event branding
		"event_title":       cfg.EventTitle,
		"event_description": cfg.EventDescription,

		// Real stats
		"stats": gin.H{
			"total_users":  totalUsers,
			"total_prs":    totalPRs,
			"merged_prs":   mergedPRs,
			"active_repos": activeRepos,
		},

		"updated_at": cfg.UpdatedAt,
		"updated_by": cfg.UpdatedBy,
	})
}

// nullableTime returns nil for zero time (GORM zero time), otherwise the time.
func nullableTime(t time.Time) interface{} {
	if t.IsZero() {
		return nil
	}
	return t
}

// ── POST /api/admin/event/close ───────────────────────────────────────────────

func (s *Server) closeEvent(c *gin.Context) {
	var input struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password is required"})
		return
	}

	if s.cfg.CloseEventPassword == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Event control not configured"})
		return
	}
	if strings.TrimSpace(input.Password) != s.cfg.CloseEventPassword {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	cfg, _ := s.getOrCreateConfig()
	cfg.IsEventActive = false
	cfg.UpdatedAt = time.Now()
	if admin, exists := c.Get("admin_username"); exists {
		cfg.UpdatedBy = admin.(string)
	}

	if err := s.db.Save(&cfg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to close event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":          "Event has been closed.",
		"is_event_active":  false,
		"updated_at":       cfg.UpdatedAt,
	})
}

// ── POST /api/admin/event/open ────────────────────────────────────────────────

func (s *Server) openEvent(c *gin.Context) {
	cfg, _ := s.getOrCreateConfig()
	cfg.IsEventActive = true
	cfg.UpdatedAt = time.Now()
	if admin, exists := c.Get("admin_username"); exists {
		cfg.UpdatedBy = admin.(string)
	}

	if err := s.db.Save(&cfg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":         "Event is now live.",
		"is_event_active": true,
		"updated_at":      cfg.UpdatedAt,
	})
}

// ── PUT /api/admin/event/config ───────────────────────────────────────────────

// updateEventConfig lets admins set start_date, end_date, event_title, event_description.
func (s *Server) updateEventConfig(c *gin.Context) {
	var input struct {
		StartDate        *time.Time `json:"start_date"`
		EndDate          *time.Time `json:"end_date"`
		EventTitle       *string    `json:"event_title"`
		EventDescription *string    `json:"event_description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	cfg, _ := s.getOrCreateConfig()

	if input.StartDate != nil {
		cfg.StartDate = *input.StartDate
	}
	if input.EndDate != nil {
		cfg.EndDate = *input.EndDate
	}
	if input.EventTitle != nil && strings.TrimSpace(*input.EventTitle) != "" {
		cfg.EventTitle = strings.TrimSpace(*input.EventTitle)
	}
	if input.EventDescription != nil {
		cfg.EventDescription = *input.EventDescription
	}
	cfg.UpdatedAt = time.Now()
	if admin, exists := c.Get("admin_username"); exists {
		cfg.UpdatedBy = admin.(string)
	}

	if err := s.db.Save(&cfg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event config"})
		return
	}

	phase := eventPhase(cfg)
	if phase == "" {
		if cfg.IsEventActive {
			phase = "active"
		} else {
			phase = "ended"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "Event configuration updated.",
		"phase":             phase,
		"start_date":        nullableTime(cfg.StartDate),
		"end_date":          nullableTime(cfg.EndDate),
		"event_title":       cfg.EventTitle,
		"event_description": cfg.EventDescription,
		"updated_at":        cfg.UpdatedAt,
	})
}
