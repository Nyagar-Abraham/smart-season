# Smart Season Field Monitoring

A comprehensive field monitoring system designed to help agricultural managers and field agents track crop progress, manage field assignments, and identify risks using AI-powered status analysis.

## Features

- **Field Management**: Create, assign, and monitor agricultural fields.
- **AI-Powered Risk Detection**: Automated status updates using AI to analyze field notes for pests, diseases, and environmental risks.
- **Role-Based Access Control**: Separate dashboards for Agricultural Managers (Admin) and Field Agents.
- **Monitoring History**: Detailed timeline of field updates with image uploads (S3-compatible).
- **Modern UI/UX**: Built with Shadcn UI and Tanstack Query for remote state management and caching.
- **Security & Rate Limiting**: Integrated with Arcjet for bot detection and request shielding.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- pnpm
- Docker & Docker Compose
- OpenAI API Key (for AI status features)
- AWS/S3 Credentials (for image uploads)

### 1. Database Setup
The project uses PostgreSQL. You can start it using Docker:
```bash
docker compose up -d
```
This starts PostgreSQL on port `5435` (mapped to `5432` internally).

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials (DATABASE_URL, OPENAI_API_KEY, ARCJET_KEY, etc.)
pnpm install
pnpm db:push  # Sync database schema
pnpm dev      # Start development server
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install
# Ensure VITE_API_URL in .env matches your backend (default: http://localhost:3000/api/v1)
pnpm dev
```

---

## Field Status Logic

The status of a field is automatically computed based on several criteria to ensure accuracy and timely intervention when problems arise.

| Status | Criteria | Logic |
| :--- | :--- | :--- |
| **Completed** | Crop Harvested | Triggered when the field's `currentStage` is set to `Harvested`. |
| **At Risk** | Inactivity | Triggered if no monitoring updates have been received for over **14 days**. |
| **At Risk** | Risk Detected | Triggered when AI analysis of monitoring notes detects issues like pests, disease, drought, or flooding. |
| **Active** | Healthy/Regular | Default state when updates are regular and no risks are detected. |

### AI Risk Analysis Logic
When a field agent submits notes, the system uses AI to categorize the field. If AI is unavailable, it falls back to keyword matching for terms such as: `pest`, `disease`, `drought`, `wilting`, `flooding`, `low germination`.

---

## Design Decisions

- **Monorepo-lite Structure**: Separate `backend` and `frontend` directories for clear separation of concerns while keeping them in a single repository for easier coordination.
- **Drizzle ORM**: Chosen for its type-safety and performance. It provides a TypeScript-first experience that syncs perfectly with my backend models.
- **TanStack Suite**: Used for the frontend to handle routing (`Router`), state management/caching (`Query`), and complex data displays (`Table`).
- **Arcjet Security**: Implemented at the middleware level to provide proactive defense against common web vulnerabilities and automated bot traffic.
- **Pino Logging**: Structured logging for better observability and debugging in production environments.
- **Infrastructure as Code**: Terraform configurations included for managing AWS S3 buckets and CORS policies, ensuring reproducible infrastructure.

---

## Assumptions

1. **Deployment Origin**: The system assumes the backend and frontend are hosted on specific origins for CORS (e.g., Render for backend, specific domain for frontend).
2. **Connectivity**: Field agents are assumed to have internet access to upload monitoring updates and images.
