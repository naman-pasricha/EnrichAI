from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import models

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    # token: str = Depends(oauth2_scheme)
) -> models.User:
    # BYPASS AUTH: Return a mock user for all API calls
    user = db.query(models.User).first()
    if not user:
        # Create one if it doesn't exist
        user = models.User(email="test@example.com", password_hash="hash", credits=999999, role=models.UserRole.ADMIN)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
