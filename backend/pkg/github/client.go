package github

import (
	"context"
	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type Client struct {
	ghClient *github.Client
}

func NewClient(ctx context.Context, accessToken string) *Client {
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: accessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	return &Client{
		ghClient: github.NewClient(tc),
	}
}

func (c *Client) GetUserPRs(ctx context.Context, username string) ([]*github.Issue, error) {
	// Search for PRs authored by the user in the nst-sdc organization with skillfest topic/label
	query := "is:pr author:" + username + " org:nst-sdc label:skillfest-accepted"
	opts := &github.SearchOptions{
		Sort: "created",
		Order: "desc",
	}
	result, _, err := c.ghClient.Search.Issues(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	return result.Issues, nil
}
