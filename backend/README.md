# AI-Powered Lead Enrichment Platform - Backend

This is the backend service for the AI Lead Enrichment Platform. It provides REST APIs built with FastAPI, background job processing with Celery and Redis, and data storage using PostgreSQL.

## Requirements
- Docker and Docker Compose

## Setup and Running

1. From the root directory (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build
   ```

2. The services will start:
   - **API Gateway (FastAPI):** http://localhost:8000
   - **Swagger UI Documentation:** http://localhost:8000/api/v1/openapi.json -> use http://localhost:8000/docs
   - **PostgreSQL Database:** localhost:5432
   - **Redis (Message Broker):** localhost:6379

## Environment Variables

Copy the `.env.example` to `.env` inside the `backend` folder (or inject via docker-compose) for production configurations:

```
SECRET_KEY=your-secure-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leadenrich
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## Architecture

- `app/main.py`: Entry point for the FastAPI application.
- `app/api/`: Contains REST API routers (e.g., auth, jobs).
- `app/core/`: Security (JWT) and config loading.
- `app/db/`: SQLAlchemy models and database connection.
- `app/services/`: Core logic (e.g., CSV parsing, LangGraph enrichment pipeline).
- `app/worker/`: Celery task definitions.

## Security Best Practices

1. **Authentication:** Uses secure JWT tokens. Ensure `SECRET_KEY` is a strong, randomly generated string in production.
2. **Passwords:** Uses `bcrypt` for password hashing before storing in the database.
3. **Data Access:** APIs utilize dependencies to fetch `current_user` and only allow users to access their own jobs/leads.
4. **Scraping Compliance:** Enrichment relies solely on public data directories and respects terms of service. Playwright runs headlessly to render dynamic JS properly without bypassing explicit authentication boundaries.
