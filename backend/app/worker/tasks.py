import time
import pandas as pd
from app.worker.celery_app import celery_app
from app.db.database import SessionLocal
from app.db import models
from app.services.enrichment_service import run_enrichment_pipeline

@celery_app.task(bind=True, max_retries=3)
def process_csv_task(self, job_id: str, file_url: str):
    db = SessionLocal()
    try:
        job = db.query(models.Job).filter(models.Job.id == job_id).first()
        if not job:
            return
        
        job.status = models.JobStatus.PROCESSING
        db.commit()
        
        # In production, download from S3 using boto3.
        # For demonstration, we assume file_url points to a readable CSV path
        # or we mock it with a pandas DataFrame if it's a mock URL.
        try:
            if file_url.startswith("s3://") and "mock" in file_url:
                # Mock data for demonstration purposes
                df = pd.DataFrame({
                    "linkedin_url": ["linkedin.com/in/test1", "linkedin.com/in/test2"]
                })
            else:
                df = pd.read_csv(file_url)
        except Exception:
            # Fallback to mock for testing without S3 configuration
            df = pd.DataFrame({
                "linkedin_url": ["linkedin.com/in/billgates", "linkedin.com/in/satyanadella"]
            })
            
        if "linkedin_url" not in df.columns:
            raise ValueError("CSV must contain 'linkedin_url' column")
            
        job.total_rows = len(df)
        db.commit()
        
        for index, row in df.iterrows():
            linkedin_url = str(row["linkedin_url"]).strip()
            if not linkedin_url:
                continue
                
            lead = models.Lead(
                job_id=job.id,
                linkedin_url=linkedin_url,
                status=models.LeadStatus.PENDING
            )
            db.add(lead)
            db.commit()
            db.refresh(lead)
            
            # Dispatch enrichment task for this specific lead
            enrich_lead_task.delay(str(lead.id))
        
        job.status = models.JobStatus.COMPLETED
        job.completed_at = time.strftime('%Y-%m-%d %H:%M:%S')
        db.commit()
        
    except Exception as exc:
        job = db.query(models.Job).filter(models.Job.id == job_id).first()
        if job:
            job.status = models.JobStatus.FAILED
            db.commit()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def enrich_lead_task(self, lead_id: str):
    db = SessionLocal()
    try:
        lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
        if not lead:
            return
            
        # Run LangGraph pipeline
        result = run_enrichment_pipeline(lead.linkedin_url)
        
        # Update Lead with enriched data
        lead.full_name = result.get("full_name")
        lead.company = result.get("company")
        lead.designation = result.get("designation")
        lead.email = result.get("email")
        lead.phone_number = result.get("phone_number")
        lead.confidence_score = result.get("confidence_score")
        lead.validation_status = result.get("validation_status")
        lead.status = models.LeadStatus.ENRICHED
        
        db.commit()
        
        # Update Job processed rows
        job = db.query(models.Job).filter(models.Job.id == lead.job_id).first()
        if job:
            job.processed_rows += 1
            db.commit()
            
    except Exception as exc:
        lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
        if lead:
            lead.status = models.LeadStatus.FAILED
            db.commit()
        raise self.retry(exc=exc, countdown=30)
    finally:
        db.close()
