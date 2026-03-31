# 🛠️ SkillFest Development & Onboarding Guide

This guide provides a standardized procedure for setting up the SkillFest platform locally for development and testing.

---

## 🏗️ Technical Prerequisites

Ensure the following tools are installed on your machine:

- **Go 1.25+**: Backend language and runtime.
- **Node.js 20+** (LTS): Frontend and Admin portal runtimes.
- **Docker & Docker Compose**: For local PostgreSQL and Redis (optional).
- **Cloudflare Tunnel (`cloudflared`)**: For production-mirror testing.

---

## 🏁 Phase 0: Repository Onboarding

Clone the repository and initialize all sub-projects:

```bash
git clone https://github.com/nst-sdc/skillfest-platform.git
cd skillfest-platform
```

---

## 🏁 Phase 1: Backend Setup (Go)

The backend is a high-concurrency Go API using PostgreSQL (NeonDB).

1.  **Configure Environment**:
    Create a `.env` file in the `backend/` directory:
    ```bash
    PORT=8080
    DB_URL=postgresql://user:pass@host:5432/skillfest
    GITHUB_CLIENT_ID=your_id
    GITHUB_CLIENT_SECRET=your_secret
    ADMIN_USER_IDS="12345,67890" # GitHub IDs for admin access
    ```
2.  **Initialize Dependencies**:
    ```bash
    cd backend
    go mod download
    ```
3.  **Run the Server**:
    ```bash
    go run cmd/server/main.go
    ```
    The API will be available at `http://localhost:8080`.

---

## 🏁 Phase 2: Frontend Setup (Next.js)

The frontend is a Next.js application using Framer Motion and Tailwind CSS.

1.  **Configure Environment**:
    Create a `.env.local` file in the `frontend/` directory:
    ```bash
    NEXT_PUBLIC_API_URL=http://localhost:8080
    NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
    ```
2.  **Install & Run**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The UI will be available at `http://localhost:3000`.

---

## 🏁 Phase 3: Admin Portal Setup (Astro)

The Admin Portal is a dedicated Astro project.

1.  **Configure Environment**:
    Create a `.env` file in the `admin-portal/` directory:
    ```bash
    PUBLIC_API_URL=http://localhost:8080
    ```
2.  **Install & Run**:
    ```bash
    cd admin-portal
    npm install
    npm run dev
    ```
    The Admin Portal will be available at `http://localhost:4321`.

---

## ☁️ Advanced: Cloudflare Tunnel Integration

For testing GitHub OAuth callbacks and production features locally, use a Cloudflare Tunnel:

1.  **Authenticate**: `cloudflared tunnel login`
2.  **Run Tunnel**:
    ```bash
    cloudflared tunnel --url http://localhost:8080
    ```
3.  **Update Config**: Replace `localhost:8080` in your GitHub App callback with the tunnel URL.

---

## 🤝 Need Help?
- **Sync Issues**: Verify your PostgreSQL connection string in `backend/.env`.
- **UI Hydration**: Ensure your system clock is accurate for framer-motion/GSAP animations.
- **Auth Errors**: Verify that your GitHub OAuth callback matches the base URL.

*Happy Coding!*
