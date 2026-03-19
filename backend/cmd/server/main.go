package main

import (
	"log"
	"net/http"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/api"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/config"
)

func main() {
	cfg := config.LoadConfig()
	router := api.NewRouter()

	log.Printf("Starting server on port %s...", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
