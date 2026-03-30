package github

import (
	"context"
	"time"
	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type Client struct {
	GhClient *github.Client
}

func NewClient(ctx context.Context, accessToken string) *Client {
	if accessToken == "" || accessToken == "your_github_system_token" {
		return &Client{
			GhClient: github.NewClient(nil),
		}
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: accessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	return &Client{
		GhClient: github.NewClient(tc),
	}
}

func (c *Client) GetUserPRs(ctx context.Context, username string) ([]*github.Issue, error) {
	query := "is:pr author:" + username + " org:nst-sdc"
	return c.SearchIssues(ctx, query)
}

func (c *Client) SearchIssues(ctx context.Context, query string) ([]*github.Issue, error) {
	opts := &github.SearchOptions{
		Sort:  "created",
		Order: "desc",
	}
	result, _, err := c.GhClient.Search.Issues(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	return result.Issues, nil
}

func (c *Client) ListRepoCommits(ctx context.Context, owner, repo string, since, until time.Time) ([]*github.RepositoryCommit, error) {
	opts := &github.CommitsListOptions{
		Since: since,
		Until: until,
	}
	commits, _, err := c.GhClient.Repositories.ListCommits(ctx, owner, repo, opts)
	return commits, err
}
