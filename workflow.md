# SkillFest Portal Workflow

This document outlines the end-to-end user journey and administrative workflow within the SkillFest platform.

## 1. Authentication and Enrollment
- **GitHub Login**: Users sign in using their GitHub account via OAuth2.
- **Profile Creation**: Upon first login, a profile is created in the backend with their GitHub metadata.
- **Enrollment**: Users must click "Enroll" on the dashboard to participate in the SkillFest event. This sets `is_enrolled: true` in the database.

## 2. Participation (Contributor Workflow)
- **Finding Challenges**: Users browse the "Projects" or "Challenges" page. These challenges are fetched directly from GitHub issues labeled `skillfest` in the `nst-sdc` organization.
- **Submitting PRs**: Users fork the relevant repository and submit a Pull Request.
- **Automatic Sync**: A background worker in the backend runs every 30 minutes to fetch PRs from GitHub, validate them, and award points based on tags (`easy`, `medium`, `hard`).

## 3. Fresher Recruitment (If Applicable)
- **Application**: Users can submit a "Fresher Application" with their portfolio and experience summary.
- **Review**: Admins review applications in the Admin Dashboard and update status (`Pending`, `Accepted`, `Rejected`).

## 4. Leaderboard and Rewards
- **Points Accumulation**: As PRs are merged or validated, users earn points.
- **Global Rank**: Users are ranked on the global leaderboard based on their total points.
- **Final Project/Swag**: Users who meet certain thresholds (e.g., 3 qualifying PRs) unlock rewards like physical swag kits.

## 5. Administrative Workflow
- **User Management**: Admins can view user details and manually adjust ranks or hidden status.
- **System Sync**: Admins can manually trigger a PR sync and point recalculation.
- **Leaderboard Control**: Admins can toggle leaderboard visibility and initialize event settings.
