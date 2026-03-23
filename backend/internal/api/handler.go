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
	"github.com/google/go-github/v60/github"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"golang.org/x/oauth2"
	gh_oauth "golang.org/x/oauth2/github"
)

type Server struct {
	router        *mux.Router
	cfg           *config.Config
	userRepo      repository.UserRepository
	prRepo        repository.PRRepository
	repoRepo      repository.RepositoryRepository
	authService   *service.AuthService
	adminService  *service.AdminService
	githubService *service.GitHubService
	syncWorker    *service.SyncWorker
	oauthConfig   *oauth2.Config
	frontendURL   string
}

func NewServer(cfg *config.Config, userRepo repository.UserRepository, prRepo repository.PRRepository, repoRepo repository.RepositoryRepository, authService *service.AuthService, adminService *service.AdminService, githubService *service.GitHubService, syncWorker *service.SyncWorker) *Server {
	s := &Server{
		router:        mux.NewRouter(),
		cfg:           cfg,
		userRepo:      userRepo,
		prRepo:        prRepo,
		repoRepo:      repoRepo,
		authService:   authService,
		adminService:  adminService,
		githubService: githubService,
		syncWorker:    syncWorker,
		frontendURL:   cfg.FrontendURL,
		oauthConfig: &oauth2.Config{
			ClientID:     cfg.GitHubClientID,
			ClientSecret: cfg.GitHubClientSecret,
			RedirectURL:  cfg.BackendURL + "/api/auth/github/callback",
			Endpoint:     gh_oauth.Endpoint,
			Scopes:       []string{"user:email", "read:user"},
		},
	}
	s.routes()
	return s
}

func (s *Server) Router() http.Handler {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{s.cfg.FrontendURL, "http://localhost:3000", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"},
		AllowCredentials: true,
		Debug:            true,
	})
	return c.Handler(s.router)
}

func (s *Server) routes() {
	s.router.HandleFunc("/api/auth/github", s.githubLogin).Methods("GET")
	s.router.HandleFunc("/api/auth/github/callback", s.githubCallback).Methods("GET")
	s.router.HandleFunc("/api/users/me", s.getCurrentUser).Methods("GET")
	s.router.HandleFunc("/api/users/{id}/dashboard", s.userDashboard).Methods("GET")
	
	s.router.HandleFunc("/api/leaderboard", s.leaderboard).Methods("GET")	
	// Repository Management (Admin)
	s.router.HandleFunc("/api/admin/repositories", s.adminMiddleware(s.listRepositories)).Methods("GET")
	s.router.HandleFunc("/api/admin/repositories", s.adminMiddleware(s.addRepository)).Methods("POST")
	s.router.HandleFunc("/api/admin/repositories/{id}", s.adminMiddleware(s.deleteRepository)).Methods("DELETE")

	s.router.HandleFunc("/api/admin/applications", s.listApplications).Methods("GET")
	s.router.HandleFunc("/api/admin/applications/{id}/status", s.updateApplicationStatus).Methods("POST")
	s.router.HandleFunc("/api/admin/user-details", s.getUserDetails).Methods("GET")
	s.router.HandleFunc("/api/admin/update-user-rank", s.updateUserRank).Methods("POST")
	s.router.HandleFunc("/api/admin/leaderboard-settings", s.handleLeaderboardSettings).Methods("GET", "POST")
	s.router.HandleFunc("/api/admin/initialize-leaderboard", s.handleLeaderboardSettings).Methods("GET", "POST")
	
	s.router.HandleFunc("/api/sync", s.syncStats).Methods("POST")
	s.router.HandleFunc("/api/profile/{username}", s.getUserProfile).Methods("GET")
	s.router.HandleFunc("/api/users/enroll", s.authMiddleware(s.enrollUser)).Methods("POST")
	
	// Issue Tracking
	s.router.HandleFunc("/api/challenges", s.getChallenges).Methods("GET")
	s.router.HandleFunc("/api/challenges/attempt", s.authMiddleware(s.attemptIssue)).Methods("POST")
	s.router.HandleFunc("/api/challenges/user-attempts", s.authMiddleware(s.getUserAttempts)).Methods("GET")
	
	s.router.HandleFunc("/api/fresher/apply", s.submitFresherApplication).Methods("POST")
}

func (s *Server) githubLogin(w http.ResponseWriter, r *http.Request) {
	url := s.oauthConfig.AuthCodeURL("state")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (s *Server) githubCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	token, err := s.oauthConfig.Exchange(r.Context(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
		return
	}

	// Fetch user info from GitHub
	client := gh.NewClient(r.Context(), token.AccessToken)
	ghUser, _, err := client.GhClient.Users.Get(r.Context(), "")
	if err != nil {
		http.Error(w, "Failed to fetch GitHub user", http.StatusInternalServerError)
		return
	}

	// Create or update user in DB
	user, err := s.userRepo.GetByGitHubID(r.Context(), fmt.Sprintf("%d", *ghUser.ID))
	if err != nil {
		// New user
		user = &model.User{
			GitHubID:    fmt.Sprintf("%d", *ghUser.ID),
			Username:    *ghUser.Login,
			Email:       ghUser.GetEmail(),
			AvatarURL:   *ghUser.AvatarURL,
			GitHubToken: token.AccessToken,
		}
		if err := s.userRepo.Create(r.Context(), user); err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	} else {
		// Existing user - update token and metadata
		user.GitHubToken = token.AccessToken
		user.AvatarURL = *ghUser.AvatarURL
		user.Email = ghUser.GetEmail()
		if err := s.userRepo.Update(r.Context(), user); err != nil {
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
			return
		}
	}

	// Create session
	jwtToken, err := s.authService.CreateSession(r.Context(), user)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Set cookie and redirect to frontend
	http.SetCookie(w, &http.Cookie{
		Name:     "skillfest_token",
		Value:    jwtToken,
		Path:     "/",
		HttpOnly: false, // Set to false so frontend can read it if needed, or use Authorization header
		MaxAge:   3600 * 72,
	})

	http.Redirect(w, r, s.cfg.FrontendURL+"/dashboard", http.StatusTemporaryRedirect)
}

func (s *Server) getCurrentUser(w http.ResponseWriter, r *http.Request) {
	tokenString, err := r.Cookie("skillfest_token")
	if err != nil {
		authHeader := r.Header.Get("Authorization")
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = &http.Cookie{Value: authHeader[7:]}
		} else {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
	}

	userID, err := s.authService.ValidateSession(tokenString.Value)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	user, err := s.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(user)
}

func (s *Server) userDashboard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	userID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := s.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	prs, _ := s.prRepo.GetByUserID(r.Context(), userID)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": user,
		"prs":  prs,
	})
}

func (s *Server) leaderboard(w http.ResponseWriter, r *http.Request) {
	users, err := s.userRepo.GetLeaderboard(r.Context(), 100)
	if err != nil {
		http.Error(w, "Error fetching leaderboard", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}

func (s *Server) listApplications(w http.ResponseWriter, r *http.Request) {
	apps, err := s.adminService.ListApplications(r.Context())
	if err != nil {
		http.Error(w, "Failed to list applications", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(apps)
}
func (s *Server) updateApplicationStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid application ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := s.adminService.ReviewApplication(r.Context(), id, req.Status); err != nil {
		http.Error(w, "Failed to update status", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) getUserDetails(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	user, err := s.userRepo.GetByUsername(r.Context(), username)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	prs, _ := s.prRepo.GetByUserID(r.Context(), user.ID)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"login":        user.Username,
		"avatar_url":   fmt.Sprintf("https://avatars.githubusercontent.com/%s", user.Username),
		"pullRequests": prs,
	})
}

func (s *Server) updateUserRank(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Rank     *int   `json:"rank"`
		Points   *int   `json:"points"`
		Hidden   *bool  `json:"hidden"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := s.userRepo.GetByUsername(r.Context(), req.Username)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if req.Points != nil {
		user.Points = *req.Points
	}
	// Note: You might want to add a 'IsHidden' field to the User model later.
	// For now, we update points if needed.
	if err := s.userRepo.Update(r.Context(), user); err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleLeaderboardSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var req struct {
			Visible bool `json:"visible"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		// In a real app, save to DB or config.
		json.NewEncoder(w).Encode(map[string]interface{}{
			"data": map[string]interface{}{
				"visible":     req.Visible,
				"lastUpdated": time.Now().Format(time.RFC3339),
			},
		})
		return
	}

	// GET settings
	json.NewEncoder(w).Encode(map[string]interface{}{
		"visible":     true,
		"lastUpdated": time.Now().Format(time.RFC3339),
	})
}

func (s *Server) assignTopRanks(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TopCount int `json:"topCount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	users, err := s.userRepo.GetLeaderboard(r.Context(), req.TopCount)
	if err != nil {
		http.Error(w, "Failed to fetch top users", http.StatusInternalServerError)
		return
	}

	for i, user := range users {
		rank := i + 1
		// In a real app, update a ManualRank field.
		// For now, we'll just log or simulate success.
		fmt.Printf("Assigning rank %d to user %s\n", rank, user.Username)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Top ranks assigned (simulated)"})
}

func (s *Server) syncStats(w http.ResponseWriter, r *http.Request) {
	go s.syncWorker.SyncAllUsers(context.Background())
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "sync triggered"})
}
func (s *Server) getUserProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	user, err := s.userRepo.GetByUsername(r.Context(), username)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	prs, err := s.prRepo.GetByUserID(r.Context(), user.ID)
	if err != nil {
		prs = []model.PullRequest{}
	}

	// Calculate rank (simulated for now, or fetch from leaderboard)
	users, _ := s.userRepo.GetLeaderboard(r.Context(), 1000)
	rank := 0
	for i, u := range users {
		if u.ID == user.ID {
			rank = i + 1
			break
		}
	}

	response := struct {
		User         *model.User          `json:"user"`
		PullRequests []model.PullRequest `json:"pull_requests"`
		Rank         int                  `json:"rank"`
	}{
		User:         user,
		PullRequests: prs,
		Rank:         rank,
	}

	json.NewEncoder(w).Encode(response)
}

func (s *Server) enrollUser(w http.ResponseWriter, r *http.Request) {
	userVal := r.Context().Value("user")
	if userVal == nil {
		http.Error(w, "Unauthorized inside context", http.StatusUnauthorized)
		return
	}
	user := userVal.(*model.User)

	user.IsEnrolled = true
	if err := s.userRepo.Update(r.Context(), user); err != nil {
		http.Error(w, "Failed to enroll user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Enrolled successfully"})
}

func (s *Server) getChallenges(w http.ResponseWriter, r *http.Request) {
	repos, err := s.repoRepo.GetActiveRepositories(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch repositories", http.StatusInternalServerError)
		return
	}

	repoQueries := ""
	for _, repo := range repos {
		repoQueries += fmt.Sprintf(" repo:%s/%s", repo.Owner, repo.Name)
	}

	if repoQueries == "" {
		// Default to nst-sdc if no repos are configured
		repoQueries = " org:nst-sdc"
	}

	query := "is:issue is:open label:skillfest" + repoQueries
	opts := &github.SearchOptions{
		Sort:  "created",
		Order: "desc",
	}

	result, _, err := s.githubService.GetClient().GhClient.Search.Issues(r.Context(), query, opts)
	if err != nil {
		http.Error(w, "Failed to fetch challenges from GitHub", http.StatusInternalServerError)
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

		// Extract repo name
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

	json.NewEncoder(w).Encode(challenges)
}
func (s *Server) submitFresherApplication(w http.ResponseWriter, r *http.Request) {
	tokenString, err := r.Cookie("skillfest_token")
	if err != nil {
		authHeader := r.Header.Get("Authorization")
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = &http.Cookie{Value: authHeader[7:]}
		} else {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
	}

	userID, err := s.authService.ValidateSession(tokenString.Value)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	var req struct {
		PortfolioURL      string `json:"portfolio_url"`
		ExperienceSummary string `json:"experience_summary"`
		Statement         string `json:"statement"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	app := &model.FresherApplication{
		UserID:            userID,
		PortfolioURL:      req.PortfolioURL,
		ExperienceSummary: req.ExperienceSummary,
		Statement:         req.Statement,
		Status:            "Pending",
	}

	if err := s.adminService.SubmitApplication(r.Context(), app); err != nil {
		http.Error(w, "Failed to submit application", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Application submitted successfully"})
}

func (s *Server) listRepositories(w http.ResponseWriter, r *http.Request) {
	repos, err := s.repoRepo.ListRepositories(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(repos)
}

func (s *Server) addRepository(w http.ResponseWriter, r *http.Request) {
	var repo model.Repository
	if err := json.NewDecoder(r.Body).Decode(&repo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := s.repoRepo.CreateRepository(r.Context(), &repo); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) deleteRepository(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	if err := s.repoRepo.DeleteRepository(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) attemptIssue(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(*model.User)
	var req struct {
		RepoID      uuid.UUID `json:"repo_id"`
		IssueNumber int       `json:"issue_number"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	attempt := &model.IssueAttempt{
		UserID:      user.ID,
		RepoID:      req.RepoID,
		IssueNumber: req.IssueNumber,
		Status:      "Attempting",
	}
	if err := s.repoRepo.CreateAttempt(r.Context(), attempt); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *Server) getUserAttempts(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(*model.User)
	attempts, err := s.repoRepo.GetUserAttempts(r.Context(), user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(attempts)
}

func (s *Server) authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("skillfest_token")
		var token string
		if err == nil {
			token = cookie.Value
		} else {
			authHeader := r.Header.Get("Authorization")
			if len(authHeader) > 7 && strings.HasPrefix(authHeader, "Bearer ") {
				token = authHeader[7:]
			} else {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
		}

		userID, err := s.authService.ValidateSession(token)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		user, err := s.userRepo.GetByID(r.Context(), userID)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func (s *Server) adminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return s.authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		user := r.Context().Value("user").(*model.User)
		if !user.IsAdmin {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
