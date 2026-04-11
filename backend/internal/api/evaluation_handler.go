package api

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─────────────────────────────────────────────────────────────────────────────
// Rubric Handlers
// ─────────────────────────────────────────────────────────────────────────────

func (s *Server) listRubrics(c *gin.Context) {
	rubrics, err := s.evaluationRepo.ListRubrics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list rubrics"})
		return
	}
	c.JSON(http.StatusOK, rubrics)
}

func (s *Server) getGlobalRubric(c *gin.Context) {
	rubric, err := s.evaluationRepo.GetGlobalRubric(c.Request.Context())
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "No global rubric configured"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get global rubric"})
		return
	}
	c.JSON(http.StatusOK, rubric)
}

func (s *Server) upsertGlobalRubric(c *gin.Context) {
	var rubric model.EvaluationRubric
	if err := c.ShouldBindJSON(&rubric); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	rubric.RepoID = nil // ensure this is the global rubric
	if err := s.evaluationRepo.UpsertRubric(c.Request.Context(), &rubric); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save rubric"})
		return
	}
	c.JSON(http.StatusOK, rubric)
}

func (s *Server) getRepoRubric(c *gin.Context) {
	repoID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid repository ID"})
		return
	}

	rubric, err := s.evaluationRepo.GetRubricByRepoID(c.Request.Context(), repoID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Fall back to global rubric
			global, gerr := s.evaluationRepo.GetGlobalRubric(c.Request.Context())
			if gerr != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "No rubric configured for this repository and no global default found"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"rubric": global, "source": "global"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get rubric"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rubric": rubric, "source": "repo"})
}

func (s *Server) upsertRepoRubric(c *gin.Context) {
	repoID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid repository ID"})
		return
	}

	var rubric model.EvaluationRubric
	if err := c.ShouldBindJSON(&rubric); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	rubric.RepoID = &repoID
	if err := s.evaluationRepo.UpsertRubric(c.Request.Context(), &rubric); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save rubric"})
		return
	}
	c.JSON(http.StatusOK, rubric)
}

func (s *Server) deleteRubric(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := s.evaluationRepo.DeleteRubric(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete rubric"})
		return
	}
	c.Status(http.StatusNoContent)
}

// ─────────────────────────────────────────────────────────────────────────────
// Evaluation Handlers
// ─────────────────────────────────────────────────────────────────────────────

func (s *Server) listEvaluations(c *gin.Context) {
	evals, err := s.evaluationRepo.ListEvaluations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list evaluations"})
		return
	}
	c.JSON(http.StatusOK, evals)
}

func (s *Server) getUserEvaluations(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	evals, err := s.evaluationRepo.ListEvaluationsByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get evaluations"})
		return
	}
	c.JSON(http.StatusOK, evals)
}

func (s *Server) upsertEvaluation(c *gin.Context) {
	var eval model.ProjectEvaluation
	if err := c.ShouldBindJSON(&eval); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := s.evaluationRepo.UpsertEvaluation(c.Request.Context(), &eval); err != nil {
		if err.Error() == "evaluation already submitted and locked" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save evaluation"})
		return
	}
	c.JSON(http.StatusOK, eval)
}

func (s *Server) submitEvaluation(c *gin.Context) {
	evalID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid evaluation ID"})
		return
	}

	// Get reviewer identity from session
	adminVal, exists := c.Get("user")
	reviewerUsername := "admin"
	if exists {
		if adminUser, ok := adminVal.(*model.User); ok {
			reviewerUsername = adminUser.Username
		}
	}

	eval, err := s.evaluationRepo.SubmitEvaluation(c.Request.Context(), evalID, reviewerUsername)
	if err != nil {
		if err.Error() == "evaluation already submitted" {
			c.JSON(http.StatusConflict, gin.H{"error": "Evaluation already submitted and locked"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit evaluation"})
		return
	}

	// Credit points to the user
	user, err := s.userRepo.GetByID(c.Request.Context(), eval.UserID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"evaluation": eval, "warning": "Points not credited: user not found"})
		return
	}
	user.Points += eval.TotalPoints
	user.LastScoreUpdatedAt = time.Now()
	if err := s.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusOK, gin.H{"evaluation": eval, "warning": "Points not credited: update failed"})
		return
	}

	// Audit Log
	if s.loggingService != nil {
		adminVal, _ := c.Get("user")
		admin := adminVal.(*model.User)
		s.loggingService.LogAuditAction(c.Request.Context(), &model.AuditLog{
			AdminID:  admin.ID,
			Action:   "SUBMIT_EVALUATION",
			TargetID: eval.UserID.String(),
			NewValue: fmt.Sprintf("points:%d, eval_id:%s", eval.TotalPoints, eval.ID),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"evaluation":     eval,
		"points_awarded": eval.TotalPoints,
		"new_total":      user.Points,
	})
}
