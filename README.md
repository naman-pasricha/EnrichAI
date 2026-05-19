# EnrichAI - AI Lead Enrichment Platform

A full-stack Next.js and FastAPI platform designed to extract and validate business contact details from public LinkedIn profiles.

## Architecture
- **Frontend**: Next.js (App Router), TailwindCSS, ShadCN UI
- **Backend**: Python FastAPI, SQLite (Local Database), Background Tasks
- **Enrichment Engine**: Mocked scraping pipeline for email discovery and validation (Fully self-contained for easy local testing).

## Running the Application Locally (No Docker Required)

This platform is configured to run instantly on your machine using SQLite and in-memory background queues.

### 1. Start the Backend API
Open a terminal in the root directory and run the following commands:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The API will be available at http://localhost:8000/docs*

### 2. Start the Frontend Dashboard
Open a **new** terminal in the root directory and run:
```bash
cd frontend
npm install
npm run dev
```
*The Next.js dashboard will be available at http://localhost:3000*

## Features
*   **Instant Drag-and-Drop Parsing**: Automatically extracts `linkedin_url` columns from `.csv` and `.xlsx` files.
*   **Bypassed Authentication**: The login screen is currently hard-wired to drop you straight into the dashboard as an Admin.
*   **Live Results Tracking**: The frontend automatically polls the backend every 5 seconds to display real-time validation statuses and discovered emails/phone numbers.
