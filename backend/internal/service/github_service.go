package service

import (
	"context"
	"strings"

	"github.com/CodeMaverick-143/skillfest-platform/backend/pkg/github"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
)

type GitHubService struct {
	client *github.Client
}

func NewGitHubService(client *github.Client) *GitHubService {
	return &GitHubService{client: client}
}

func (s *GitHubService) FetchAndValidatePRs(ctx context.Context, username string) ([]model.PullRequest, error) {
	issues, err := s.client.GetUserPRs(ctx, username)
	if err != nil {
		return nil, err
	}

	var validPRs []model.PullRequest
	for _, issue := range issues {
		// Basic validation: must be a PR (Search.Issues returns both issues and PRs)
		if issue.PullRequestLinks == nil {
			continue
		}

		// Extract repo name from URL
		urlParts := strings.Split(*issue.RepositoryURL, "/")
		repoName := urlParts[len(urlParts)-1]

		// Check eligibility (e.g., specific labels or topics)
		eligible := false
		for _, label := range issue.Labels {
			if strings.ToLower(*label.Name) == "skillfest-accepted" {
				eligible = true
				break
			}
		}

		if eligible {
			state := *issue.State
			pr := model.PullRequest{
				RepoName:   repoName,
				PRNumber:   *issue.Number,
				Title:      *issue.Title,
				URL:        *issue.HTMLURL,
				State:      state,
				CreatedAt:  issue.GetCreatedAt().Time,
			}
			if state == "closed" {
				// We'd need to check if it was merged, but for now simplify
				// Real implementation would use GetPullRequest to get merged_at
			}
			validPRs = append(validPRs, pr)
		}
	}

	return validPRs, nil
}
