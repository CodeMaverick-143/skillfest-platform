package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/config"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/service"
	gh "github.com/CodeMaverick-143/skillfest-platform/backend/pkg/github"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/google/go-github/v60/github"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	gh_oauth "golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type Server struct {
	router           *gin.Engine
	cfg              *config.Config
	userRepo         repository.UserRepository
	prRepo           repository.PRRepository
	repoRepo         repository.RepositoryRepository
	contributionRepo repository.ContributionRepository
	authService      *service.AuthService
	adminService     *service.AdminService
	githubService    *service.GitHubService
	syncWorker       *service.SyncWorker
	loggingService   service.LoggingService
	cacheService     service.CacheService
	analyticsService *service.AnalyticsService
	oauthConfig      *oauth2.Config
	adminOauthConfig *oauth2.Config
	googleOauth      *oauth2.Config
	frontendURL      string
	evaluationRepo   repository.EvaluationRepository
	db               *gorm.DB
}

func NewServer(cfg *config.Config, db *gorm.DB, userRepo repository.UserRepository, prRepo repository.PRRepository, repoRepo repository.RepositoryRepository, contributionRepo repository.ContributionRepository, authService *service.AuthService, adminService *service.AdminService, githubService *service.GitHubService, syncWorker *service.SyncWorker, loggingService service.LoggingService, cacheService service.CacheService, analyticsService *service.AnalyticsService, evaluationRepo repository.EvaluationRepository) *Server {
	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	s := &Server{
		router:           gin.New(), // Use gin.New() to add specific middlewares manually
		cfg:              cfg,
		db:               db,
		userRepo:         userRepo,
		prRepo:           prRepo,
		repoRepo:         repoRepo,
		contributionRepo: contributionRepo,
		authService:      authService,
		adminService:     adminService,
		githubService:    githubService,
		syncWorker:       syncWorker,
		loggingService:   loggingService,
		cacheService:     cacheService,
		analyticsService: analyticsService,
		frontendURL:      cfg.FrontendURL,
		evaluationRepo:   evaluationRepo,
		oauthConfig: &oauth2.Config{
			ClientID:     cfg.GitHubClientID,
			ClientSecret: cfg.GitHubClientSecret,
			RedirectURL:  cfg.BackendURL + "/api/auth/github/callback",
			Endpoint:     gh_oauth.Endpoint,
			Scopes:       []string{"user:email", "read:user"},
		},
		adminOauthConfig: &oauth2.Config{
			ClientID:     cfg.AdminGitHubClientID,
			ClientSecret: cfg.AdminGitHubClientSecret,
			RedirectURL:  cfg.BackendURL + "/api/auth/admin/github/callback",
			Endpoint:     gh_oauth.Endpoint,
			Scopes:       []string{"user:email", "read:user"},
		},
		googleOauth: &oauth2.Config{
			ClientID:     cfg.GoogleClientID,
			ClientSecret: cfg.GoogleClientSecret,
			RedirectURL:  cfg.BackendURL + "/api/auth/google/callback",
			Endpoint:     google.Endpoint,
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"},
		},
	}
	s.setupRouter()
	return s
}

func (s *Server) Router() http.Handler {
	return s.router
}

func (s *Server) setupRouter() {
	// Standard middlewares
	s.router.Use(gin.Logger())
	s.router.Use(gin.Recovery())
	// Build CORS allowed origins from config
	allowedOrigins := []string{
		s.cfg.FrontendURL,
		s.cfg.AdminFrontendURL,
		"https://skillfest.nstsdc.org",
		"https://skillfest-admin.xplnhub.tech",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:4321",
	}
	// Append any extra origins from env (comma-separated)
	if s.cfg.AdditionalCORSOrigins != "" {
		for _, o := range strings.Split(s.cfg.AdditionalCORSOrigins, ",") {
			if trimmed := strings.TrimSpace(o); trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
	}

	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "CF-Connecting-IP"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Trust Cloudflare proxy IPs so c.ClientIP() returns the real visitor IP
	// Cloudflare IP ranges (IPv4) — update periodically from https://www.cloudflare.com/ips/
	s.router.SetTrustedProxies([]string{
		"103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
		"104.16.0.0/13", "104.24.0.0/14",
		"108.162.192.0/18", "131.0.72.0/22",
		"141.101.64.0/18", "162.158.0.0/15",
		"172.64.0.0/13", "173.245.48.0/20",
		"188.114.96.0/20", "190.93.240.0/20",
		"197.234.240.0/22", "198.41.128.0/17",
		"127.0.0.1", // local dev
	})
	s.router.Use(gzip.Gzip(gzip.DefaultCompression))

	api := s.router.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.GET("/github/login", s.githubLogin)
			auth.GET("/github/callback", s.githubCallback)
			auth.GET("/google/callback", s.googleCallback)
			
			// Admin auth
			auth.GET("/admin/github/login", s.adminGithubLogin)
			auth.GET("/admin/github/callback", s.adminGithubCallback)
		}

		// Public user profile
		api.GET("/profile/:username", s.getUserProfile)

		// User specific routes
		api.GET("/users/me", s.getCurrentUser)
		api.GET("/users/:id/dashboard", s.userDashboard)
		api.POST("/users/enroll", s.authMiddleware(), s.enrollUser)

		// Competition routes
		api.GET("/leaderboard", s.leaderboard)
		api.GET("/challenges", s.getChallenges)
		api.POST("/challenges/attempt", s.authMiddleware(), s.attemptIssue)
		api.GET("/challenges/user-attempts", s.authMiddleware(), s.getUserAttempts)

		// Admin routes
		admin := api.Group("/admin", s.authMiddleware(), s.adminMiddleware())
		{
			admin.GET("/stats", s.loggingMiddleware(), s.getAdminStats)
			admin.GET("/users", s.loggingMiddleware(), s.adminListUsers)
			admin.PATCH("/users/:id/points", s.loggingMiddleware(), s.updateUserPoints)
			admin.PATCH("/users/:id/status", s.loggingMiddleware(), s.updateUserStatus)
			admin.GET("/users/:id/analytics", s.loggingMiddleware(), s.getUserAnalytics)
			admin.GET("/user-details", s.getUserDetails)
			admin.POST("/update-user-rank", s.loggingMiddleware(), s.updateUserRank)
			admin.GET("/applications", s.listApplications)
			admin.POST("/applications/:id/status", s.updateApplicationStatus)
			admin.GET("/prs/merged", s.loggingMiddleware(), s.listMergedPRs)
			admin.GET("/logs", s.loggingMiddleware(), s.getAdminLogs)
			admin.GET("/leaderboard-settings", s.loggingMiddleware(), s.handleLeaderboardSettings)
			admin.POST("/leaderboard-settings", s.loggingMiddleware(), s.handleLeaderboardSettings)

			// Rubric routes (per repo)
			admin.GET("/rubric", s.listRubrics)
			admin.GET("/rubric/default", s.getGlobalRubric)
			admin.POST("/rubric/default", s.upsertGlobalRubric)
			admin.GET("/repositories/:id/rubric", s.getRepoRubric)
			admin.PUT("/repositories/:id/rubric", s.upsertRepoRubric)
			admin.DELETE("/repositories/:id/rubric", s.deleteRubric)

			// Evaluation routes
			admin.GET("/evaluations", s.listEvaluations)
			admin.GET("/evaluations/user/:user_id", s.getUserEvaluations)
			admin.POST("/evaluations", s.upsertEvaluation)
			admin.POST("/evaluations/:id/submit", s.submitEvaluation)

			repos := admin.Group("/repositories")
			{
				repos.GET("", s.listRepositories)
				repos.POST("", s.addRepository)
				repos.PUT("/:id", s.updateRepository)
				repos.DELETE("/:id", s.deleteRepository)
			}
		}

		api.POST("/sync", s.syncStats)
		api.POST("/fresher/apply", s.submitFresherApplication)

		// Public event status — used by frontend to check if event is open
		api.GET("/event/status", s.getEventStatus)

		// Admin event lifecycle control
		admin.POST("/event/close", s.closeEvent)
		admin.POST("/event/open", s.openEvent)
		admin.PUT("/event/config", s.updateEventConfig)
	}
}
func (s *Server) githubLogin(c *gin.Context) {
	url := s.oauthConfig.AuthCodeURL("state")
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (s *Server) githubCallback(c *gin.Context) {
	code := c.Query("code")
	token, err := s.oauthConfig.Exchange(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	client := gh.NewClient(c.Request.Context(), token.AccessToken)
	ghUser, _, err := client.GhClient.Users.Get(c.Request.Context(), "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch GitHub user"})
		return
	}

	user, err := s.userRepo.GetByGitHubID(c.Request.Context(), fmt.Sprintf("%d", *ghUser.ID))
	if err != nil {
		user = &model.User{
			GitHubID:    fmt.Sprintf("%d", *ghUser.ID),
			Username:    *ghUser.Login,
			Email:       ghUser.GetEmail(),
			AvatarURL:   *ghUser.AvatarURL,
			GitHubToken: token.AccessToken,
		}
		if err := s.userRepo.Create(c.Request.Context(), user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else {
		user.GitHubToken = token.AccessToken
		user.AvatarURL = *ghUser.AvatarURL
		if err := s.userRepo.Update(c.Request.Context(), user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}
	}

	jwtToken, err := s.authService.CreateSession(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	c.SetCookie("skillfest_token", jwtToken, 3600*72, "/", "", false, false)
	c.Redirect(http.StatusTemporaryRedirect, s.cfg.FrontendURL+"/dashboard")
}

func (s *Server) adminGithubLogin(c *gin.Context) {
	url := s.adminOauthConfig.AuthCodeURL("state-admin")
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (s *Server) adminGithubCallback(c *gin.Context) {
	code := c.Query("code")
	token, err := s.adminOauthConfig.Exchange(c.Request.Context(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/login?error=auth_failed")
		return
	}

	client := gh.NewClient(c.Request.Context(), token.AccessToken)
	ghUser, _, err := client.GhClient.Users.Get(c.Request.Context(), "")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/login?error=fetch_failed")
		return
	}

	user, err := s.userRepo.GetByGitHubID(c.Request.Context(), fmt.Sprintf("%d", *ghUser.ID))
	if err != nil {
		// New admin or user not in DB yet
		user = &model.User{
			GitHubID:    fmt.Sprintf("%d", *ghUser.ID),
			Username:    *ghUser.Login,
			Email:       ghUser.GetEmail(),
			AvatarURL:   *ghUser.AvatarURL,
			GitHubToken: token.AccessToken,
		}
		
		// Check for bootstrap admin list
		adminList := strings.Split(s.cfg.AdminUsernames, ",")
		for _, name := range adminList {
			if strings.TrimSpace(name) == *ghUser.Login {
				user.IsAdmin = true
				break
			}
		}

		if err := s.userRepo.Create(c.Request.Context(), user); err != nil {
			c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/login?error=create_failed")
			return
		}
	} else {
		// Update admin if in bootstrap list but not set in DB
		adminList := strings.Split(s.cfg.AdminUsernames, ",")
		for _, name := range adminList {
			if strings.TrimSpace(name) == *ghUser.Login && !user.IsAdmin {
				user.IsAdmin = true
			}
		}

		user.GitHubToken = token.AccessToken
		user.AvatarURL = *ghUser.AvatarURL
		if err := s.userRepo.Update(c.Request.Context(), user); err != nil {
			c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/login?error=update_failed")
			return
		}
	}

	if !user.IsAdmin {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/login?error=not_authorized")
		return
	}

	jwtToken, err := s.authService.CreateSession(c.Request.Context(), user)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/login?error=session_failed")
		return
	}

	c.SetCookie("skillfest_token", jwtToken, 3600*72, "/", "", false, false)
	c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/")
}

func (s *Server) getCurrentUser(c *gin.Context) {
	tokenString, err := c.Cookie("skillfest_token")
	if err != nil {
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = authHeader[7:]
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
	}

	userID, err := s.authService.ValidateSession(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
		return
	}

	user, err := s.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) userDashboard(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := s.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	prs, err := s.prRepo.GetFilteredByUser(c.Request.Context(), userID)
	if err != nil {
		prs = []model.PullRequest{}
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
		"prs":  prs,
	})
}

func (s *Server) leaderboard(c *gin.Context) {
	// Try cache first
	var cachedUsers []model.User
	if s.cacheService != nil {
		err := s.cacheService.Get(c.Request.Context(), "leaderboard", &cachedUsers)
		if err == nil && len(cachedUsers) > 0 {
			c.JSON(http.StatusOK, cachedUsers)
			return
		}
	}

	users, err := s.userRepo.GetLeaderboard(c.Request.Context(), 100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching leaderboard"})
		return
	}

	// Set cache
	if s.cacheService != nil {
		s.cacheService.Set(c.Request.Context(), "leaderboard", users, time.Minute)
	}

	c.JSON(http.StatusOK, users)
}

func (s *Server) listApplications(c *gin.Context) {
	apps, err := s.adminService.ListApplications(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list applications"})
		return
	}
	c.JSON(http.StatusOK, apps)
}

func (s *Server) updateApplicationStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := s.adminService.ReviewApplication(c.Request.Context(), id, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (s *Server) getUserDetails(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	user, err := s.userRepo.GetByUsername(c.Request.Context(), username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	prs, _ := s.prRepo.GetByUserID(c.Request.Context(), user.ID)

	c.JSON(http.StatusOK, gin.H{
		"login":        user.Username,
		"avatar_url":   fmt.Sprintf("https://avatars.githubusercontent.com/%s", user.Username),
		"pullRequests": prs,
	})
}

func (s *Server) updateUserRank(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Rank     *int   `json:"rank"`
		Points   *int   `json:"points"`
		Hidden   *bool  `json:"hidden"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	user, err := s.userRepo.GetByUsername(c.Request.Context(), req.Username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if req.Points != nil {
		user.Points = *req.Points
	}
	if err := s.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.Status(http.StatusOK)
}

func (s *Server) handleLeaderboardSettings(c *gin.Context) {
	if c.Request.Method == "POST" {
		var req struct {
			Visible bool `json:"visible"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"visible":     req.Visible,
				"lastUpdated": time.Now().Format(time.RFC3339),
			},
		})
		return
	}

	// GET settings
	c.JSON(http.StatusOK, gin.H{
		"visible":     true,
		"lastUpdated": time.Now().Format(time.RFC3339),
	})
}

func (s *Server) assignTopRanks(c *gin.Context) {
	var req struct {
		TopCount int `json:"topCount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	users, err := s.userRepo.GetLeaderboard(c.Request.Context(), req.TopCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top users"})
		return
	}

	for i, user := range users {
		rank := i + 1
		fmt.Printf("Assigning rank %d to user %s\n", rank, user.Username)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Top ranks assigned (simulated)"})
}

func (s *Server) syncStats(c *gin.Context) {
	go s.syncWorker.SyncAllRepos(context.Background())
	c.JSON(http.StatusOK, gin.H{"status": "sync triggered"})
}

func (s *Server) getUserProfile(c *gin.Context) {
	username := c.Param("username")

	user, err := s.userRepo.GetByUsername(c.Request.Context(), username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	filteredPRs, err := s.prRepo.GetFilteredByUser(c.Request.Context(), user.ID)
	if err != nil {
		filteredPRs = []model.PullRequest{}
	}

	// Calculate rank (simulated for now, or fetch from leaderboard)
	users, _ := s.userRepo.GetLeaderboard(c.Request.Context(), 1000)
	rank := 0
	for i, u := range users {
		if u.ID == user.ID {
			rank = i + 1
			break
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"user":          user,
		"pull_requests": filteredPRs,
		"rank":          rank,
	})
}

func (s *Server) enrollUser(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized inside context"})
		return
	}
	user := userVal.(*model.User)

	user.IsEnrolled = true
	if err := s.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enroll user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Enrolled successfully"})
}

func (s *Server) getChallenges(c *gin.Context) {
	// Try cache for repos
	var repos []model.Repository
	cacheHit := false
	if s.cacheService != nil {
		err := s.cacheService.Get(c.Request.Context(), "active_repos", &repos)
		if err == nil && len(repos) > 0 {
			cacheHit = true
		}
	}

	if !cacheHit {
		var err error
		repos, err = s.repoRepo.GetActiveRepositories(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch repositories"})
			return
		}
		if s.cacheService != nil {
			s.cacheService.Set(c.Request.Context(), "active_repos", repos, 5*time.Minute)
		}
	}

	repoQueries := ""
	for _, repo := range repos {
		owner := repo.Owner
		name := repo.Name

		for _, val := range []string{repo.Owner, repo.Name} {
			if strings.HasPrefix(val, "https://github.com/") {
				parts := strings.Split(strings.TrimPrefix(val, "https://github.com/"), "/")
				if len(parts) >= 2 {
					owner = parts[0]
					name = parts[1]
				}
				break
			}
		}

		repoQueries += fmt.Sprintf(" repo:%s/%s", owner, name)
	}

	if repoQueries == "" {
		c.JSON(http.StatusOK, []map[string]interface{}{})
		return
	}

	query := "is:issue is:open" + repoQueries
	opts := &github.SearchOptions{
		Sort:  "created",
		Order: "desc",
	}

	result, _, err := s.githubService.GetClient().GhClient.Search.Issues(c.Request.Context(), query, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch challenges from GitHub: " + err.Error()})
		return
	}

	var challenges []map[string]interface{}
	for _, issue := range result.Issues {
		difficulty := "easy"
		points := 10
		var labels []string

		for _, label := range issue.Labels {
			name := strings.ToLower(*label.Name)
			labels = append(labels, name)
			if strings.Contains(name, "hard") {
				difficulty = "hard"
				points = 50
			} else if strings.Contains(name, "medium") {
				difficulty = "medium"
				points = 25
			}
		}

		urlParts := strings.Split(*issue.RepositoryURL, "/")
		repo := urlParts[len(urlParts)-1]

		challenges = append(challenges, map[string]interface{}{
			"id":         *issue.ID,
			"title":      *issue.Title,
			"repo":       repo,
			"url":        *issue.HTMLURL,
			"labels":     labels,
			"difficulty": difficulty,
			"points":     points,
		})
	}

	c.JSON(http.StatusOK, challenges)
}

func (s *Server) submitFresherApplication(c *gin.Context) {
	tokenString, err := c.Cookie("skillfest_token")
	if err != nil {
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = authHeader[7:]
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
	}

	userID, err := s.authService.ValidateSession(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
		return
	}

	var req struct {
		PortfolioURL      string `json:"portfolio_url" binding:"required"`
		ExperienceSummary string `json:"experience_summary" binding:"required"`
		Statement         string `json:"statement" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	app := &model.FresherApplication{
		UserID:            userID,
		PortfolioURL:      req.PortfolioURL,
		ExperienceSummary: req.ExperienceSummary,
		Statement:         req.Statement,
		Status:            "Pending",
	}

	if err := s.adminService.SubmitApplication(c.Request.Context(), app); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit application"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Application submitted successfully"})
}

func (s *Server) attemptIssue(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	var req struct {
		RepoID      uuid.UUID `json:"repo_id" binding:"required"`
		IssueNumber int       `json:"issue_number" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	attempt := &model.IssueAttempt{
		UserID:      user.ID,
		RepoID:      req.RepoID,
		IssueNumber: req.IssueNumber,
		Status:      "Attempting",
	}
	if err := s.repoRepo.CreateAttempt(c.Request.Context(), attempt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusCreated)
}

func (s *Server) getUserAttempts(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(*model.User)

	attempts, err := s.repoRepo.GetUserAttempts(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, attempts)
}

func (s *Server) authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("skillfest_token")
		var token string
		if err == nil {
			token = cookie
		} else {
			authHeader := c.GetHeader("Authorization")
			if len(authHeader) > 7 && strings.HasPrefix(authHeader, "Bearer ") {
				token = authHeader[7:]
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
				c.Abort()
				return
			}
		}

		userID, err := s.authService.ValidateSession(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		user, err := s.userRepo.GetByID(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		if user.IsBanned {
			c.JSON(http.StatusForbidden, gin.H{"error": "This account has been banned from the event."})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Next()
	}
}

func (s *Server) googleLogin(c *gin.Context) {
	url := s.googleOauth.AuthCodeURL("state-google")
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (s *Server) googleCallback(c *gin.Context) {
	code := c.Query("code")
	token, err := s.googleOauth.Exchange(c.Request.Context(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.FrontendURL+"/login?error=google_auth_failed")
		return
	}

	// Fetch user info from Google
	client := s.googleOauth.Client(c.Request.Context(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.FrontendURL+"/login?error=google_fetch_user_failed")
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.FrontendURL+"/login?error=google_decode_failed")
		return
	}

	// Verify if user exists and is admin in NeonDB
	dbUser, err := s.userRepo.GetByEmail(c.Request.Context(), googleUser.Email)
	if err != nil || dbUser == nil || !dbUser.IsAdmin {
		c.Redirect(http.StatusTemporaryRedirect, s.cfg.FrontendURL+"/login?error=not_authorized_admin")
		return
	}

	// Create JWT and redirect to admin portal
	jwtToken, err := s.authService.CreateSession(c.Request.Context(), dbUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.SetCookie("skillfest_token", jwtToken, 86400, "/", "", false, true)
	c.Redirect(http.StatusTemporaryRedirect, s.cfg.AdminFrontendURL+"/")
}

func (s *Server) loggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		userID := "anonymous"
		if exists {
			user := userVal.(*model.User)
			userID = user.ID.String()
		}

		// Log the action asynchronously
		if s.loggingService != nil {
			go s.loggingService.LogAction(context.Background(), service.AdminLog{
				UserID:   userID,
				Action:   fmt.Sprintf("%s %s", c.Request.Method, c.Request.URL.Path),
				Metadata: map[string]string{"ip": c.ClientIP()},
			})
		}

		c.Next()
	}
}

func (s *Server) adminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		user := userVal.(*model.User)
		if !user.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
		c.Next()
	}
}
