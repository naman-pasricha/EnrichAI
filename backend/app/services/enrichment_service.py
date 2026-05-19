import random
from typing import Optional

def run_enrichment_pipeline(linkedin_url: str) -> dict:
    domains = ["acme.com", "techflow.io", "globalnet.com", "innovate.co"]
    first_names = ["John", "Sarah", "Mike", "Emily", "David"]
    last_names = ["Doe", "Smith", "Jones", "Brown", "Wilson"]
    
    first = random.choice(first_names)
    last = random.choice(last_names)
    domain = random.choice(domains)
    email = f"{first.lower()}.{last.lower()}@{domain}"
    
    statuses = ["VALID", "CATCH_ALL", "INVALID"]
    
    return {
        "full_name": f"{first} {last}",
        "company": domain.split('.')[0].capitalize(),
        "designation": "Executive",
        "email": email,
        "phone_number": f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}" if random.random() > 0.3 else "Not Found",
        "confidence_score": random.randint(60, 99),
        "validation_status": random.choice(statuses)
    }
