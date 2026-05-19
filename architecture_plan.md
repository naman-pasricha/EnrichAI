# AI-Powered Lead Enrichment Platform: System Architecture & Stack

## 1. System Architecture Overview

The system follows a modern, decoupled microservices architecture designed for scalability, asynchronous processing, and AI orchestration.

### Core Components:
1.  **Frontend (Next.js Application):** A responsive, Next.js SPA acting as the user dashboard. It handles authentication, CSV uploads (directly to S3/R2 or via backend), polling/webhooks for job status, and displaying paginated results.
2.  **API Gateway / Core Backend (FastAPI):** Handles HTTP requests, authentication (JWT), rate limiting, database CRUD operations, and enqueuing jobs.
3.  **Task Queue (Redis + Celery):** Manages asynchronous background processing. Essential for handling long-running lead enrichment tasks without blocking the API.
4.  **Worker Nodes (Celery Workers):** Consume jobs from the queue. They execute the CSV parsing, orchestrate the AI agents (LangGraph), interact with external APIs, and update the database.
5.  **AI Enrichment Engine (LangGraph/LangChain):** A stateful graph of agents that takes a LinkedIn URL, gathers public data, performs email/phone discovery, validates them, and assigns confidence scores.
6.  **Database (PostgreSQL):** Stores user data, credits, job metadata, and the enriched lead records.
7.  **Object Storage (AWS S3 / Cloudflare R2):** Stores raw uploaded CSVs and the generated enriched CSV exports.

## 2. Technology Stack Selection & Justification

### Frontend
*   **Framework:** Next.js (React)
    *   *Why:* Offers excellent developer experience, App Router for clean layouts, Server Components for performance, and seamless API integration.
*   **Styling & UI:** TailwindCSS + ShadCN UI
    *   *Why:* Tailwind provides utility-first rapid styling. ShadCN provides accessible, customizable, and premium-looking components without the bloat of traditional component libraries.
*   **State Management:** Zustand
    *   *Why:* Lightweight, unopinionated, and much simpler boilerplate than Redux, perfect for managing job queue states and UI toggles.
*   **Data Tables:** TanStack Table
    *   *Why:* Headless UI library perfect for building complex, paginated, and sortable data tables for the enriched results.

### Backend
*   **Framework:** Python FastAPI
    *   *Why:* Python is the undisputed king of AI/Data Engineering. FastAPI is blazingly fast, heavily utilizes Python's `asyncio` for high concurrency, and automatically generates OpenAPI (Swagger) docs.
*   **AI/Agent Framework:** LangGraph + LangChain
    *   *Why:* LangGraph excels at creating complex, stateful multi-actor agent workflows. Ideal for a multi-step enrichment pipeline (Extract -> Discover Email -> Discover Phone -> Validate -> Score).
*   **Automation:** Playwright
    *   *Why:* Robust headless browser automation for tasks requiring JS rendering or interacting with public directories (strictly adhering to ToS and avoiding credential theft/bypasses).

### Infrastructure & Data
*   **Database:** PostgreSQL
    *   *Why:* The industry standard open-source relational database. Perfect for structuring Users, Jobs, and relational Lead Data.
*   **Cache & Queue:** Redis + Celery
    *   *Why:* Standard, rock-solid Python task queue architecture. Redis acts as the fast in-memory broker.
*   **Storage:** Cloudflare R2 (S3 Compatible)
    *   *Why:* Zero egress fees compared to AWS S3, highly scalable for handling user CSV uploads and downloads.

## 3. Database Schema (PostgreSQL)

### Table: `users`
*   `id` (UUID, Primary Key)
*   `email` (String, Unique)
*   `password_hash` (String)
*   `credits` (Integer, Default: 100)
*   `api_key` (String, Unique, Nullable)
*   `role` (Enum: USER, ADMIN)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### Table: `jobs`
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key -> users.id)
*   `status` (Enum: PENDING, PROCESSING, COMPLETED, FAILED)
*   `total_rows` (Integer)
*   `processed_rows` (Integer, Default: 0)
*   `file_url` (String) - S3 URI of original file
*   `result_file_url` (String, Nullable) - S3 URI of processed file
*   `created_at` (Timestamp)
*   `completed_at` (Timestamp, Nullable)

### Table: `leads`
*   `id` (UUID, Primary Key)
*   `job_id` (UUID, Foreign Key -> jobs.id)
*   `linkedin_url` (String)
*   `full_name` (String, Nullable)
*   `company` (String, Nullable)
*   `designation` (String, Nullable)
*   `email` (String, Nullable)
*   `phone_number` (String, Nullable)
*   `confidence_score` (Float, Nullable) - 0.0 to 100.0
*   `validation_status` (Enum: VALID, CATCH_ALL, INVALID, UNKNOWN)
*   `status` (Enum: PENDING, ENRICHED, FAILED)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

## 4. Implementation Steps

1.  **Backend Foundation:** Initialize FastAPI, SQLAlchemy models, Alembic migrations, and basic CRUD/Auth APIs.
2.  **Queue Setup:** Integrate Celery and Redis. Create dummy worker tasks to ensure the queue processes correctly.
3.  **Enrichment Engine:** Build the LangGraph pipeline and individual LangChain tools for finding emails, phones, and validation.
4.  **CSV Processor:** Build the service that streams the S3 file, parses rows, creates `Lead` records, and dispatches Celery tasks per row or batch.
5.  **Frontend Foundation:** Initialize Next.js, ShadCN, Tailwind. Build Auth pages and Dashboard layout.
6.  **Frontend Integration:** Build the Drag-and-Drop uploader, API integrations for jobs, and the TanStack results table.
7.  **Dockerization & Polish:** Create `docker-compose.yml`, write the README, and configure deployment scripts.
