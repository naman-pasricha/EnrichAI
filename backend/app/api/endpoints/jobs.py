from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any, List
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db import models
from app.services.job_service import process_csv_sync

router = APIRouter()

class JobResponse(BaseModel):
    id: str
    status: str
    total_rows: int
    processed_rows: int
    file_url: str

class LeadResponse(BaseModel):
    id: str
    linkedin_url: str
    full_name: str | None
    company: str | None
    designation: str | None
    email: str | None
    phone_number: str | None
    confidence_score: float | None
    validation_status: str | None
    status: str

@router.post("/", response_model=JobResponse)
async def create_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are allowed.")
    
    mock_s3_url = f"s3://bucket/uploads/{uuid.uuid4()}_{file.filename}"
    
    job = models.Job(
        user_id=current_user.id,
        file_url=mock_s3_url,
        status=models.JobStatus.PENDING
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Dispatch native FastAPI background task instead of Celery
    background_tasks.add_task(process_csv_sync, str(job.id), mock_s3_url)
    
    return {
        "id": str(job.id),
        "status": job.status.value,
        "total_rows": job.total_rows,
        "processed_rows": job.processed_rows,
        "file_url": job.file_url
    }

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    jobs = db.query(models.Job).filter(models.Job.user_id == current_user.id).offset(skip).limit(limit).all()
    return [
        {
            "id": str(j.id),
            "status": j.status.value,
            "total_rows": j.total_rows,
            "processed_rows": j.processed_rows,
            "file_url": j.file_url
        } for j in jobs
    ]

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": str(job.id),
        "status": job.status.value,
        "total_rows": job.total_rows,
        "processed_rows": job.processed_rows,
        "file_url": job.file_url
    }

@router.get("/{job_id}/leads", response_model=List[LeadResponse])
def get_job_leads(
    job_id: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    leads = db.query(models.Lead).filter(models.Lead.job_id == job_id).offset(skip).limit(limit).all()
    
    return [
        {
            "id": str(lead.id),
            "linkedin_url": lead.linkedin_url,
            "full_name": lead.full_name,
            "company": lead.company,
            "designation": lead.designation,
            "email": lead.email,
            "phone_number": lead.phone_number,
            "confidence_score": lead.confidence_score,
            "validation_status": lead.validation_status.value if lead.validation_status else "UNKNOWN",
            "status": lead.status.value
        } for lead in leads
    ]
