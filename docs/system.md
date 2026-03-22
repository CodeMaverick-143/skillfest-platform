# System Design Document: SkillFest Hacktoberfest‑Style Platform

## Overview

SkillFest is a Hacktoberfest‑style developer event platform that encourages open‑source contributions to the `nst-sdc` GitHub organization. The system is built as a full‑stack web application using **Next.js (frontend)**, a **Go backend**, and **NeonDB (PostgreSQL)** for persistence. The platform tracks GitHub pull requests automatically, computes user scores and levels, and exposes a real‑time leaderboard and personal dashboard for participants.

The main user flows are:
- GitHub‑based sign‑in and registration.
- Auto‑tracking of qualifying PRs during a defined event period.
- Progress visualization, level badges, and leaderboard rankings.
- Admin review interface for the Fresher Developer Program.

***

## Core components

### 1. Frontend (Next.js)

The Next.js application serves as the public‑facing UI and optional backend‑for‑frontend (BFF) layer.

Key responsibilities:
- Rendering:
  - Landing page, event rules, and FAQ.
  - User dashboard (PRs, progress, level).
  - Global leaderboard.
  - Admin pages (candidate review, configuration).
- Authentication:
  - Initiates GitHub OAuth flow.
  - Stores session tokens (e.g., JWT or cookie‑based) and user state.
- Data orchestration:
  - Manages API calls to the Go backend for:
    - User dashboard data.
    - Leaderboard.
    - Application status (for Fresher Program).
- Responsive and accessible UI built with:
  - App Router (Next.js).
  - React components and hooks.
  - Tailwind CSS for styling.

***

### 2. Backend (Go service)

A standalone Go HTTP server exposes REST‑style endpoints consumed by the Next.js frontend and, optionally, background workers.

Main responsibilities:
- API endpoints:
  - Auth: GitHub OAuth callback, user session creation.
  - User: profile, level, points, PR list.
  - PRs: create, update, or sync PR‑related records.
  - Leaderboard: list top contributors with filters.
  - Admin: Fresher Program CRUD (applications, status).
- GitHub integration:
  - Manages GitHub API calls:
    - Fetch user PRs in a given time window.
    - Inspect repository ownership / topics to determine eligibility.
    - Update PR state and labels.
  - Implements business logic:
    - Rule evaluation (e.g., “is this PR a valid SkillFest contribution?”).
    - Spam or low‑quality‑PR filtering heuristics.
- Data processing:
  - Syncs GitHub PR data into the database.
  - Recalculates user points and levels.
  - Maintains leaderboard snapshot views.

The Go service runs as a long‑running process, typically behind a reverse proxy or container orchestrator, and can be scaled horizontally if needed.

***

### 3. Database (NeonDB – PostgreSQL)

NeonDB is a managed PostgreSQL instance used as the primary data store for all persistent entities.

Key entities modeled:
- **Users**: GitHub‑linked accounts with unique identifiers and metadata.
- **Repos**: `nst‑sdc` repositories participating in SkillFest (or repos tagged with an event topic).
- **Pull Requests**: PRs filed by users during the event period, with:
  - State (open / merged / closed).
  - Labels (including SkillFest‑specific labels).
  - Difficulty and points.
- **User Levels**: Denormalized view of user scores, level (`Newcomer`, `Beginner`, `Intermediate`, `Advanced`, `Expert`), and last‑updated timestamp.
- **Leaderboard snapshots**: Materialized or computed views ordered by points.

The database schema is migratable (e.g., via SQL‑based migrations) and is configured with indexes for common queries:
- PRs by user, by repo, by date range.
- Users by points for leaderboard reads.

***

## Workflows

### 1. User registration & sign‑in

1. User visits the Next.js homepage and clicks “Sign in with GitHub”.
2. GitHub OAuth flow is initiated:
   - Redirect to GitHub.
   - GitHub returns an authorization code.
   - Next.js sends code to Go backend.
3. Go backend:
   - Exchanges code for an access token.
   - Fetches basic GitHub user info.
   - Creates or updates a `users` record.
4. Session is established; user is redirected to their dashboard.

### 2. PR tracking and validation

1. A periodic background job (or webhook‑driven job) runs in the Go backend:
   - For each registered user, queries GitHub for PRs in the event window.
   - Filters repos by `nst‑sdc` ownership or SkillFest topic.
   - Checks PR state and labels (e.g., `skillfest‑accepted`).
2. For each qualifying PR:
   - A record is created/updated in `skillfest_pull_requests`.
   - Points are assigned based on difficulty/category.
3. User points and level are recalculated and stored in `user_levels`.

Events can be treated as read‑only snapshots after the event ends, or scores can be updated incrementally in real time.

### 3. Dashboard and leaderboard

1. When a user visits the dashboard:
   - Next.js calls Go backend `/api/users/{id}/dashboard`.
   - Backend returns:
     - List of PRs and their status.
     - Progress toward the required PR count (e.g., 3/3).
     - Current level badge.
2. When the leaderboard page is loaded:
   - Next.js calls `/api/leaderboard`.
   - Backend returns:
     - Top contributors ordered by points.
     - Optional filters (level, repo, event year).
3. Leaderboard data is often cached or materialized for fast reads.

### 4. Fresher Developer Program (admin flow)

1. Candidate fills a form in Next.js (GitHub profile, experience, portfolio, statement).
2. Go backend:
   - Stores the application in the database.
   - Exposes an admin endpoint for listing applications.
3. Admins:
   - Log in via a separate admin workflow.
   - Use the admin dashboard to:
     - View applications.
     - Mark as `Pending`, `Approved`, or `Rejected`.
     - See full resumes, portfolios, and contact details.

This flow is decoupled from the PR‑tracking logic and can be extended to export candidates for interviews or HR systems.

***

## Architecture relationships

- **Next.js ↔ Go backend**  
  - Next.js renders pages and calls Go API endpoints for dynamic data.
  - Go service is the source of truth for user state, PRs, and scores.
- **Go backend ↔ GitHub API**  
  - Go periodically polls GitHub (or listens to webhooks) to sync PRs.
  - OAuth tokens for GitHub are stored and used strictly by the backend.
- **Go backend ↔ NeonDB**  
  - Go uses a PostgreSQL driver (e.g., `pgx`) to connect to NeonDB.
  - Transactions are used where needed to keep PR state and points consistent.
- **NeonDB ↔ Read‑heavy clients**  
  - Leaderboard queries leverage indexes and possibly materialized views.
  - Admin dashboards query application and candidate data.

***

## Configuration and operations

- **Environment variables**:
  - GitHub OAuth client ID, client secret, redirect URL.
  - NeonDB connection string.
  - Event window (start and end dates).
  - PR‑eligibility rules (required count, repos, labels).
- **Deployment**:
  - Next.js is deployed as a static/SSR app (Vercel, Netlify, or self‑hosted).
  - Go backend runs as a standalone service or container (e.g., Docker).
  - NeonDB is provisioned and scaled via Neon’s console.
- **Observability**:
  - Basic logging for:
    - Auth flow.
    - GitHub API errors.
    - PR‑sync jobs.
  - Optional monitoring for:
    - API latency.
    - Job durations.

***

## Non‑functional characteristics

- **Usability**:
  - Clear progress indicators and gamified level badges (Hacktoberfest‑style).
  - Simple call‑to‑action for first‑time contributors.
- **Performance**:
  - Leaderboard queries optimized via indexes and caching.
  - PR‑sync jobs batched and rate‑limited against GitHub’s API limits.
- **Security**:
  - GitHub tokens never exposed to the frontend.
  - User‑specific data is always scoped by authenticated user ID.
- **Maintainability**:
  - Modular Go service (handlers, services, models).
  - Versioned database migrations.
  - Clear separation between event‑specific logic and generic user/PR models.

