package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/CodeMaverick-143/skillfest-platform/backend/pkg/github"
	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	gh "github.com/google/go-github/v60/github"
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

func (s *GitHubService) FetchRepoContributions(ctx context.Context, repo model.Repository) ([]model.Contribution, error) {
	var contributions []model.Contribution

	// 1. Fetch PRs
	query := fmt.Sprintf("repo:%s/%s is:pr created:%s..%s", repo.Owner, repo.Name, repo.StartDate.Format("2006-01-02"), repo.EndDate.Format("2006-01-02"))
	issues, err := s.client.SearchIssues(ctx, query)
	if err == nil {
		for _, issue := range issues {
			contributions = append(contributions, model.Contribution{
				RepoID:     repo.ID,
				Type:       "PR",
				ExternalID: fmt.Sprintf("%d", *issue.Number),
				Points:     s.calculatePoints(issue.Labels),
				OccurredAt: issue.GetCreatedAt().Time,
				Metadata:   fmt.Sprintf(`{"title": %q, "author": %q}`, *issue.Title, *issue.User.Login),
			})
		}
	}

	// 2. Fetch Commits
	commits, err := s.client.ListRepoCommits(ctx, repo.Owner, repo.Name, repo.StartDate, repo.EndDate)
	if err == nil {
		for _, commit := range commits {
			author := "unknown"
			if commit.Author != nil {
				author = *commit.Author.Login
			}
			contributions = append(contributions, model.Contribution{
				RepoID:     repo.ID,
				Type:       "Commit",
				ExternalID: *commit.SHA,
				Points:     5, // Base points for commit
				OccurredAt: commit.Commit.Author.GetDate().Time,
				Metadata:   fmt.Sprintf(`{"message": %q, "author": %q}`, *commit.Commit.Message, author),
			})
		}
	}

	return contributions, nil
}

func (s *GitHubService) calculatePoints(labels []*gh.Label) int {
	points := 10 // Base
	for _, label := range labels {
		name := strings.ToLower(*label.Name)
		switch {
		case strings.Contains(name, "hard"):
			return 50
		case strings.Contains(name, "medium"):
			return 25
		}
	}
	return points
}
