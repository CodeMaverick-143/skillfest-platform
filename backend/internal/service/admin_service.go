package service

import (
	"context"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/repository"
)

type AdminService struct {
	fresherRepo repository.FresherRepository
}

func NewAdminService(repo repository.FresherRepository) *AdminService {
	return &AdminService{fresherRepo: repo}
}

func (s *AdminService) SubmitApplication(ctx context.Context, app *model.FresherApplication) error {
	return s.fresherRepo.CreateApplication(ctx, app)
}

func (s *AdminService) ListApplications(ctx context.Context) ([]model.FresherApplication, error) {
	return s.fresherRepo.ListApplications(ctx)
}

func (s *AdminService) ReviewApplication(ctx context.Context, id string, status string) error {
	return s.fresherRepo.UpdateStatus(ctx, id, status)
}
