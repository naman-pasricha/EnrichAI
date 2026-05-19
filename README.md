# AI-Powered Lead Enrichment Platform

This repository contains a full production-ready SaaS platform for AI-driven lead enrichment. It allows users to upload CSVs of LinkedIn profiles, extracts publicly available data, discovers contact information (emails/phones), validates them, and produces an enriched CSV file.

## System Architecture

The platform follows a decoupled, asynchronous microservices architecture to handle long-running enrichment jobs at scale.

1.  **Frontend (`/frontend`)**: Next.js 14+ (App Router), React, TailwindCSS, ShadCN UI, Zustand, TanStack Table.
2.  **Backend API (`/backend`)**: Python FastAPI for fast, async HTTP routing and OpenAPI documentation.
3.  **Task Worker (`/backend/app/worker`)**: Celery + Redis for processing CSV uploads, chunking them, and executing the enrichment pipeline asynchronously.
4.  **Enrichment Engine (`/backend/app/services`)**: LangGraph & LangChain orchestrating Playwright (public data scraping) and various public APIs/logic to discover and validate contact info.
5.  **Database (`PostgreSQL`)**: Relational database for storing user accounts, job metadata, and individual lead status.
6.  **Storage (`S3/Cloudflare R2`)**: Object storage for handling raw uploads and exported results.

## Folder Structure

```
/
├── frontend/                # Next.js web application
│   ├── src/app/             # Pages and layouts (App Router)
│   ├── src/components/      # Reusable UI components (ShadCN)
│   └── package.json
│
├── backend/                 # FastAPI & Celery services
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, jobs)
│   │   ├── core/            # Configuration and Security
│   │   ├── db/              # SQLAlchemy models & session
│   │   ├── services/        # LangGraph enrichment pipelines & CSV parsers
│   │   └── worker/          # Celery app and background tasks
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml       # Orchestrates API, Worker, Redis, PostgreSQL
└── README.md                # This file
```

## Getting Started

### Backend
1. Navigate to the root directory.
2. Ensure Docker is running.
3. Run `docker-compose up --build`.
4. The API will be available at `http://localhost:8000/docs`.

### Frontend
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the dashboard at `http://localhost:3000`.

## Features
- JWT Authentication & RBAC.
- Drag-and-drop CSV upload for processing.
- Real-time job status via Celery task tracking.
- LangGraph-powered dynamic enrichment (Public data -> Email Guesser -> Validator).
- Downloadable enriched CSVs via AWS S3 / Cloudflare R2 integrations.

## Compliance
This system strictly avoids ToS violations, CAPTCHA bypassing, or illegal scraping. Data is sourced from public search engines, company domain combinations, and SMTP validations (Catch-All detection).
