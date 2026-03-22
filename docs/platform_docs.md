# SkillFest Platform Documentation

Welcome to the SkillFest Platform! This document provides information on features, data sources, and backend status.

## Current Project Status: **MVP Phase**

### Features Working with Backend
- ✅ **Authentication**: GitHub OAuth2 login and callback flow.
- ✅ **User Profiles**: Persistent storage of user data, points, and levels.
- ✅ **PR Sync (On-Demand)**: Fetching and validating PRs for a specific user.
- ✅ **Enrollment System**: Registration for the SkillFest event.
- ✅ **Fresher Applications**: Submission and review of recruitment forms.
- ✅ **Leaderboard**: Global ranking based on validated PR points.
- ✅ **Challenge Discovery**: Live search of issues from the `nst-sdc` GitHub org.

### Features with Mock/Simulated Data
- ⚠️ **Background PR Sync**: Currently uses a `PLACEHOLDER_TOKEN` in the main server loop. This needs to be replaced with a proper GitHub system token to function in the background.
- ⚠️ **Admin Stats Sync**: The endpoint `/api/admin/recalculate-points` exists but contains placeholder logic.
- ⚠️ **Manual Rank Assignment**: The `/api/admin/update-user-rank` endpoint only updates points; manual rank tracking is not yet implemented in the schema.
- ⚠️ **Leaderboard Configuration**: Toggling visibility and initialization are handled in memory and logs but are not persisted to a configuration table in the database.
- ⚠️ **Swag Kit Redemption**: The frontend displays a "Claim" button, but the backend redemption logic and fulfillment tracking are not yet implemented.
- ⚠️ **User Details (Admin View)**: Certain metadata like hidden status or manual rank flags are not yet in the `User` model.

## Backend Technical Stack
- **Language**: Go (Golang)
- **Framework**: Gorilla Mux for routing, GORM for Database ORM.
- **Database**: PostgreSQL (NeonDB).
- **Security**: JWT-based session management and GitHub OAuth2.
- **Background Tasks**: Ticker-based PR sync worker.
