package api

import (
	"net/http"
	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	// Auth routes
	r.HandleFunc("/api/auth/github", GitHubAuthHandler).Methods("GET")
	r.HandleFunc("/api/auth/github/callback", GitHubCallbackHandler).Methods("GET")

	// User routes
	r.HandleFunc("/api/users/{id}/dashboard", UserDashboardHandler).Methods("GET")

	// Leaderboard routes
	r.HandleFunc("/api/leaderboard", LeaderboardHandler).Methods("GET")

	return r
}

func GitHubAuthHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("GitHub Auth Placeholder"))
}

func GitHubCallbackHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("GitHub Callback Placeholder"))
}

func UserDashboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("User Dashboard Placeholder"))
}

func LeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Leaderboard Placeholder"))
}
