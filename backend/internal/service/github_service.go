package service

import (
	"context"
	"fmt"

	// "strings"

	"github.com/CodeMaverick-143/skillfest-platform/backend/internal/model"
	"github.com/CodeMaverick-143/skillfest-platform/backend/pkg/github"
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

	dateFilter := ""
	if !repo.StartDate.IsZero() && !repo.EndDate.IsZero() {
		dateFilter = fmt.Sprintf(" merged:%s..%s", repo.StartDate.Format("2006-01-02"), repo.EndDate.Format("2006-01-02"))
	} else if !repo.StartDate.IsZero() {
		dateFilter = fmt.Sprintf(" merged:>=%s", repo.StartDate.Format("2006-01-02"))
	} else if !repo.EndDate.IsZero() {
		dateFilter = fmt.Sprintf(" merged:<=%s", repo.EndDate.Format("2006-01-02"))
	}

	query := fmt.Sprintf("repo:%s/%s is:pr is:merged%s", repo.Owner, repo.Name, dateFilter)
	issues, err := s.client.SearchIssues(ctx, query)
	if err != nil {
		fmt.Printf("SearchIssues error for query %q: %v\n", query, err)
	} else {
		for _, issue := range issues {
			occurredAt := issue.GetCreatedAt().Time
			if issue.ClosedAt != nil {
				occurredAt = issue.GetClosedAt().Time
			}
			contributions = append(contributions, model.Contribution{
				RepoID:     &repo.ID,
				Type:       "PR",
				ExternalID: fmt.Sprintf("%d", *issue.Number),
				Points:     0, // Manual review will allot points from repo settings
				OccurredAt: occurredAt,
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
				RepoID:     &repo.ID,
				Type:       "Commit",
				ExternalID: *commit.SHA,
				Points:     5, // Keep automatic for minor commits or adjust if needed
				OccurredAt: commit.Commit.Author.GetDate().Time,
				Metadata:   fmt.Sprintf(`{"message": %q, "author": %q}`, *commit.Commit.Message, author),
			})
		}
	}

	return contributions, nil
}
