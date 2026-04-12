package api

import (
	"context"
	"net/http"

	"fmt"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (s *Server) getAdminStats(c *gin.Context) {
	stats, err := s.adminService.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stats"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (s *Server) adminListUsers(c *gin.Context) {
	users, err := s.adminService.ListUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) updateUserPoints(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input struct {
		Points int `json:"points" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := s.adminService.UpdateUserPoints(c.Request.Context(), userID, input.Points); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update points"})
		return
	}

	// Audit Log
	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)
	s.loggingService.LogAuditAction(c.Request.Context(), &model.AuditLog{
		AdminID:  admin.ID,
		Action:   "UPDATE_USER_POINTS",
		TargetID: userID.String(),
		NewValue: fmt.Sprintf("%d", input.Points),
		Reason:   c.Query("reason"),
	})

	// Invalidate leaderboard cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "leaderboard")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Points updated successfully"})
}

func (s *Server) updateUserStatus(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input struct {
		IsHidden   bool `json:"is_hidden"`
		IsBanned   bool `json:"is_banned"`
		IsAdmin    bool `json:"is_admin"`
		IsReviewer bool `json:"is_reviewer"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := s.adminService.UpdateUserStatus(c.Request.Context(), userID, input.IsHidden, input.IsBanned, input.IsAdmin, input.IsReviewer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	// Audit Log
	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)
	s.loggingService.LogAuditAction(c.Request.Context(), &model.AuditLog{
		AdminID:  admin.ID,
		Action:   "UPDATE_USER_STATUS",
		TargetID: userID.String(),
		NewValue: fmt.Sprintf("hidden:%v, banned:%v, admin:%v, reviewer:%v", input.IsHidden, input.IsBanned, input.IsAdmin, input.IsReviewer),
		Reason:   c.Query("reason"),
	})

	// Invalidate leaderboard cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "leaderboard")
	}

	c.JSON(http.StatusOK, gin.H{"message": "User status updated successfully"})
}

func (s *Server) listMergedPRs(c *gin.Context) {
	prs, err := s.adminService.ListMergedPRs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list PRs"})
		return
	}
	c.JSON(http.StatusOK, prs)
}

func (s *Server) listRepositories(c *gin.Context) {
	repos, err := s.adminService.ListRepositories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, repos)
}

func (s *Server) addRepository(c *gin.Context) {
	var repo model.Repository
	if err := c.ShouldBindJSON(&repo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := s.adminService.AddRepository(c.Request.Context(), &repo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Audit Log
	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)
	s.loggingService.LogAuditAction(c.Request.Context(), &model.AuditLog{
		AdminID:  admin.ID,
		Action:   "ADD_REPOSITORY",
		TargetID: repo.ID.String(),
		NewValue: fmt.Sprintf("%s/%s", repo.Owner, repo.Name),
	})

	// Invalidate cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "active_repos")
	}

	// Trigger immediate metadata sync
	go s.syncWorker.SyncRepoMetadata(context.Background(), repo.ID)

	c.JSON(http.StatusCreated, repo)
}

func (s *Server) deleteRepository(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := s.adminService.DeleteRepository(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Audit Log
	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)
	s.loggingService.LogAuditAction(c.Request.Context(), &model.AuditLog{
		AdminID:  admin.ID,
		Action:   "DELETE_REPOSITORY",
		TargetID: id.String(),
	})

	// Invalidate cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "active_repos")
	}
	c.Status(http.StatusOK)
}

func (s *Server) updateRepository(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var repo model.Repository
	if err := c.ShouldBindJSON(&repo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	repo.ID = id

	if err := s.adminService.UpdateRepository(c.Request.Context(), &repo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Invalidate cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "active_repos")
	}

	// Trigger immediate metadata sync
	go s.syncWorker.SyncRepoMetadata(context.Background(), repo.ID)

	c.JSON(http.StatusOK, repo)
}

func (s *Server) getUserAnalytics(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	progress, err := s.analyticsService.GetUserProgress(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}
func (s *Server) authorizePR(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PR ID"})
		return
	}

	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)

	if err := s.adminService.AuthorizePR(c.Request.Context(), id, admin.Username); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Invalidate leaderboard cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "leaderboard")
	}

	c.JSON(http.StatusOK, gin.H{"message": "PR authorized and points awarded"})
}

func (s *Server) rejectPR(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PR ID"})
		return
	}

	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)

	if err := s.adminService.RejectPR(c.Request.Context(), id, admin.Username); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Invalidate leaderboard cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "leaderboard")
	}

	c.JSON(http.StatusOK, gin.H{"message": "PR rejected"})
}

func (s *Server) authorizeAllPRs(c *gin.Context) {
	userVal, _ := c.Get("user")
	admin := userVal.(*model.User)

	if err := s.adminService.AuthorizeAllPRs(c.Request.Context(), admin.Username); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Invalidate leaderboard cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "leaderboard")
	}

	c.JSON(http.StatusOK, gin.H{"message": "All pending PRs authorized"})
}
