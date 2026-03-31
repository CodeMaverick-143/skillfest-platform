# SkillFest Deployment Guide (Cloudflare)

This guide walks you through deploying the SkillFest platform using Cloudflare for DNS, WAF, and Hosting.

## Architecture Overview
- **Frontend**: Next.js deployed on Cloudflare Pages.
- **Admin Portal**: Astro deployed on Cloudflare Pages.
- **Backend**: Go API deployed on a VPS and proxied through Cloudflare.
- **Database**: NeonDB (PostgreSQL).
- **Cache**: Redis (Upstash or Managed).
- **Logs**: MongoDB Atlas.

---

## 1. Backend Deployment (VPS)

### Prerequisites
- A VPS (Ubuntu/Debian recommended) with Docker and Docker Compose installed.
- A domain pointed to Cloudflare.

### Steps
1.  **Clone the repository** to your VPS.
2.  **Navigate to the backend**: `cd backend`
3.  **Create an `.env` file** based on `.env.example`:
    ```bash
    GITHUB_CLIENT_ID=your_id
    GITHUB_CLIENT_SECRET=your_secret
    ... (add all required vars)
    ```
4.  **Start the container**:
    ```bash
    docker-compose up -d --build
    ```
5.  **Expose to Cloudflare**:
    - In Cloudflare Dashboard, go to **Zero Trust > Networks > Tunnels**.
    - Create a new Tunnel (e.g., `skillfest-api-tunnel`).
    - Run the provided `cloudflared` command on your VPS.
    - Map a hostname (e.g., `api.skillfest.org`) to `http://localhost:8080`.

---

## 2. Frontend & Admin Deployment (Cloudflare Pages)

### Next.js Frontend
1.  In Cloudflare Dashboard, go to **Workers & Pages > Create > Pages > Connect to Git**.
2.  Select the `skillfest-platform` repository.
3.  **Build Settings**:
    - Project name: `skillfest-frontend`
    - Framework preset: `Next.js`
    - Root directory: `/frontend`
    - Build command: `npx @cloudflare/next-on-pages@1`
    - Output directory: `.next`
4.  **Environment Variables**:
    - Add `NEXT_PUBLIC_API_URL` (e.g., `https://api.skillfest.org`).
5.  **Deployment**: Click **Save and Deploy**.

### Astro Admin Portal
1.  Repeat the steps above for a new Pages project.
2.  **Build Settings**:
    - Project name: `skillfest-admin`
    - Framework preset: `Astro`
    - Root directory: `/admin-portal`
    - Build command: `npm run build`
    - Output directory: `dist`
3.  **Environment Variables**:
    - Add `PUBLIC_API_URL` (e.g., `https://api.skillfest.org`).
4.  **Deployment**: Click **Save and Deploy**.

---

## 3. Security Hardening

### Cloudflare WAF Settings
- **Security Level**: Set to "Medium" or "High".
- **Bot Fight Mode**: Enable.
- **WAF Rules**: Enable the "Cloudflare Managed Ruleset".

### Backend Security
- The Go backend now includes:
  - **Rate Limiting**: 5 req/s per IP.
  - **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
  - **Cloudflare IP Trust**: Configured to trust Cloudflare Proxy IPs.

### Database Stability
- **NeonDB**: Ensure you are using the pooled connection string in production to prevent connection exhaustion.
