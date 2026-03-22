# SkillFest Platform

SkillFest is a Hacktoberfest-style developer event platform built for open-source communities. It automates PR tracking, awards points, and gamifies the contribution experience.

## 🚀 Repository Structure

This is a monorepo containing both the backend and frontend components of the SkillFest platform.

- **[backend/](./backend)**: Go-based REST API with GORM and PostgreSQL integration.
- **[frontend/](./frontend)**: Next.js application with Tailwind CSS, Framer Motion, and a unified Admin dashboard.
- **[docs/](./docs)**: Comprehensive documentation, system design, and workflows.

## 🛠️ Getting Started

### Prerequisites
- Go 1.25+
- Node.js 20+
- PostgreSQL (NeonDB recommended)

### Backend Setup
1. `cd backend`
2. `go mod download`
3. Create a `.env` file based on `.env.example`
4. `go run cmd/server/main.go`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8080`
4. `npm run dev`

## 📖 Documentation
Detailed documentation is available in the [docs/](./docs) directory:
- [System Design](./docs/system.md)
- [Workflow Guide](./docs/workflow.md)
- [Platform Roadmap](./docs/platform_docs.md)

## 🤝 Contributing
We welcome contributions! Please check the [docs/workflow.md](./docs/workflow.md) for participation rules.

---
Built with ❤️ by the SkillFest Team
