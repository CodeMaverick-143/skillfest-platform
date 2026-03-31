# 🚀 SkillFest API Reference (v1)

This guide documents the core REST endpoints for the SkillFest Go backend. All documentation refers to the standard backend running at `http://localhost:8080`.

---

## 🔐 Authentication (GitHub OAuth)

The platform uses GitHub for standardized user identity.

- **`GET /api/auth/github`**: Redirects to the GitHub OAuth authorization page.
- **`GET /api/auth/github/callback`**: Receives the code from GitHub and creates a session.
- **`POST /api/auth/logout`**: Terminate the current session.

---

## 📈 Event & Status (Public)

Publicly accessible endpoints for the frontend components.

- **`GET /api/event/status`**: Returns the current event phase (`coming_soon`, `active`, `ended`), along with the title and description.
- **`GET /api/leaderboard`**: Returns the top 100 contributors, ranked by points.

---

## 🏗️ Public Projects & Repositories

- **`GET /api/projects`**: Lists all active repositories participating in the current SkillFest challenge.
- **`GET /api/stats`**: Returns platform-wide statistics (Total Users, Total PRs, Merged PRs, etc.).

---

## 👤 User Profile (Authenticated)

- **`GET /api/user/me`**: Returns the profile, points, and current level of the authenticated user.
- **`GET /api/user/prs`**: Lists the current user's pull requests and their contribution status.

---

## 🛠️ Admin Management (Admin Only)

Requires a session and a user ID present in the `ADMIN_USER_IDS` environment variable.

- **`GET /api/admin/applications`**: List all applicant records for the Fresher Developer Program.
- **`POST /api/admin/config`**: Update the global event configuration (title, dates, status).
- **`POST /api/admin/sync`**: Trigger a manual background sync with GitHub's current PR states.

---

## 🚦 Common Status Codes

| Code | Description |
| :--- | :--- |
| **200 OK** | The request was successful. |
| **201 Created** | A new resource was created successfully. |
| **400 Bad Request** | The request was invalid or missing parameters. |
| **401 Unauthorized** | A valid session token is missing. |
| **403 Forbidden** | The user does not have administrative privileges. |
| **500 Error** | An internal server error occurred (check logs). |

---

Built with ❤️ by the **SkillFest Engineering Team**.  
*Empowering developers to build the future of Open Source.*
