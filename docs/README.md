# 📖 SkillFest Documentation Hub

Welcome to the internal documentation for the **SkillFest Platform**. This directory contains all technical deep-dives, operational guides, and onboarding information for developers and maintainers.

---

## 🚀 Onboarding & Development

Getting started as a developer or contributor:

-   **[Local Setup Guide](./DEVELOPMENT.md)**: Standardized environment configuration.
-   **[Workflow Guide](./workflow.md)**: PR contribution rules and GitHub tracking mechanics.
-   **[API Reference](./API.md)**: Technical specifications for the Go backend.

---

## 🏗️ Technical Reference

Deep-dives into the platform's internals:

-   **[System Design & Architecture](./system.md)**: Full-stack data flow and database schema.
-   **[Event Logic & States](./event.md)**: Detailed breakdown of the event phases (Coming Soon, Active, Ended).
-   **[Platform Roadmap](./platform_docs.md)**: Future features and current technical debt.

---

## ☁️ Operations & Deployment

Guides for managing the production environment:

-   **[Deployment Guide](./deploy.md)**: Cloudflare (Pages/Tunnels) and VPS management.
-   **[Security & WAF](./deploy.md#3-security-hardening)**: Protecting the API and frontend.

---

## 🔧 Component Structure

| Component | Technology | Directory |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16+, Tailwind v4, Framer Motion | [`/frontend`](../frontend) |
| **Backend** | Go (1.25+), PostgreSQL, GORM | [`/backend`](../backend) |
| **Admin Portal** | Astro, TypeScript | [`/admin-portal`](../admin-portal) |
| **Infrastructure** | Cloudflare Pages, Docker Compose | Root |

---

Built with ❤️ by the **SkillFest Engineering Team**.  
*Empowering developers to build the future of Open Source.*
