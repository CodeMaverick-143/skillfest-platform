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

func (s *GitHubService) GetClient() *github.Client {
	return s.client
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

		// Extract and format labels
		var labels []string
		difficulty := "easy" // default
		points := 10        // default for skillfest label alone

		for _, label := range issue.Labels {
			name := strings.ToLower(*label.Name)
			labels = append(labels, name)
			
			switch {
			case strings.Contains(name, "hard"):
				difficulty = "hard"
				points = 50
			case strings.Contains(name, "medium"):
				difficulty = "medium"
				points = 25
			case strings.Contains(name, "easy"):
				difficulty = "easy"
				// points already 10
			}
		}

		state := *issue.State
		if state == "closed" && issue.PullRequestLinks != nil {
			// Check if it was actually merged
			prInfo, _, err := s.client.GhClient.PullRequests.Get(ctx, "nst-sdc", repoName, *issue.Number)
			if err == nil && prInfo.GetMerged() {
				state = "merged"
			}
		}

		pr := model.PullRequest{
			RepoName:   repoName,
			PRNumber:   *issue.Number,
			Title:      *issue.Title,
			URL:        *issue.HTMLURL,
			State:      state,
			Difficulty: difficulty,
			Labels:     strings.Join(labels, ","),
			Points:     points,
			IsOrg:      true, // Since we search with org:nst-sdc
			CreatedAt:  issue.GetCreatedAt().Time,
		}
		
		validPRs = append(validPRs, pr)
	}

	return validPRs, nil
}
