package api

import (
	"net/http"

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
		IsHidden bool `json:"is_hidden"`
		IsBanned bool `json:"is_banned"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := s.adminService.UpdateUserStatus(c.Request.Context(), userID, input.IsHidden, input.IsBanned); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
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

func (s *Server) getAdminLogs(c *gin.Context) {
	logs, err := s.loggingService.GetLogs(c.Request.Context(), 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch logs"})
		return
	}
	c.JSON(http.StatusOK, logs)
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
	// Invalidate cache
	if s.cacheService != nil {
		s.cacheService.Delete(c.Request.Context(), "active_repos")
	}
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
