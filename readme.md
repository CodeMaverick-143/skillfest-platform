# 🚀 SkillFest Platform 2026

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](/)
[![License](https://img.shields.io/badge/License-MIT-blue)](/)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare-orange)](/)

**SkillFest** is a premium, high-octane developer event platform designed for open-source communities. Built with modern engineering at its core, it automates pull request tracking, validates developer skills with real-world code analysis, and gamifies the contribution experience through a live, responsive leaderboard.

---

## ✨ Key Features

- 🏎️ **Live Performance Tracking**: Automated sync with GitHub repositories via optimized Go backend.
- 🎨 **Premium UI/UX**: Glassmorphism design system using Next.js, Tailwind v4, and Framer Motion.
- 📊 **Real-time Leaderboard**: Instant updates on rankings, points, and merged PRs.
- 🔐 **Secure Onboarding**: Seamless GitHub OAuth integration for all participants.
- 🛠️ **Admin Hub**: Dedicated Astro-based command center for event configuration and moderation.

---

## 🏗️ Repository Architecture

This is a high-performance monorepo organized for maximum scalability:

- **[`/frontend`](./frontend)**: Next.js App Router | Framer Motion | Tailwind CSS
- **[`/backend`](./backend)**: High-concurrency Go API | PostgreSQL (NeonDB) | Docker
- **[`/admin-portal`](./admin-portal)**: Astro.js | TypeScript | Admin Dashboard
- **[`/docs`](./docs)**: System Architecture, API Specs, and Workflow Guides

---

## 🚦 Quick Start

### 1. Prerequisites
- **Go 1.25+** (Backend)
- **Node.js 20+** (Frontend/Admin)
- **PostgreSQL** (NeonDB or Local)
- **Cloudflare Tunnel** (For local production-mirror testing)

### 2. Backend Setup
```bash
cd backend
go mod download
cp .env.example .env # Configure your DB and GitHub OAuth
go run cmd/server/main.go
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev # Runs on http://localhost:3000
```

---

## 📖 Complete Documentation

Deep-dive into the platform internals via our structured documentation hub:

- 🏠 **[Documentation Hub](./docs/README.md)**: Start here for all internal guides.
- 🛠️ **[Onboarding & Local Setup](./docs/DEVELOPMENT.md)**: Guide for new contributors.
- ⚙️ **[System Architecture](./docs/system.md)**: Technical deep-dive.
- ☁️ **[Deployment Guide](./docs/deploy.md)**: Cloudflare and VPS workflows.

---

Built with ❤️ by the **SkillFest Engineering Team**.  
*Empowering developers to build the future of Open Source.*
