from app.db.database import SessionLocal
from app.db import models
from app.core.security import get_password_hash

db = SessionLocal()
email = "Namanpasricha111@gmail.com"
password = "1234"
credits = 999999999

user = db.query(models.User).filter(models.User.email == email).first()
if user:
    user.password_hash = get_password_hash(password)
    user.credits = credits
else:
    user = models.User(
        email=email,
        password_hash=get_password_hash(password),
        credits=credits,
        role=models.UserRole.ADMIN
    )
    db.add(user)

db.commit()
print("User created/updated successfully")
