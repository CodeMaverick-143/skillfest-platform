package api

import (
	"encoding/json"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/service"
)

type Server struct {
	router       *mux.Router
	userRepo     repository.UserRepository
	prRepo       repository.PRRepository
	authService  *service.AuthService
	adminService *service.AdminService
}

func NewServer(userRepo repository.UserRepository, prRepo repository.PRRepository, authService *service.AuthService, adminService *service.AdminService) *Server {
	s := &Server{
		router:       mux.NewRouter(),
		userRepo:     userRepo,
		prRepo:       prRepo,
		authService:  authService,
		adminService: adminService,
	}
	s.routes()
	return s
}

func (s *Server) Router() *mux.Router {
	return s.router
}

func (s *Server) routes() {
	s.router.HandleFunc("/api/auth/github/callback", s.githubCallback).Methods("GET")
	s.router.HandleFunc("/api/users/{id}/dashboard", s.userDashboard).Methods("GET")
	s.router.HandleFunc("/api/leaderboard", s.leaderboard).Methods("GET")
}

func (s *Server) githubCallback(w http.ResponseWriter, r *http.Request) {
	// Logic to exchange code and create session
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "message": "Auth implementation placeholder"})
}

func (s *Server) userDashboard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

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
