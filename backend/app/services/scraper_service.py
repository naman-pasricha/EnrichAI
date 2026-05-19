import re
from langchain_community.tools import DuckDuckGoSearchRun
from typing import Dict, Optional

def extract_public_profile_info(linkedin_url: str) -> Dict[str, Optional[str]]:
    """
    Compliant public data extraction.
    Instead of scraping LinkedIn directly (which violates ToS and requires auth bypass),
    we use a public search engine to find the profile's indexed meta description.
    """
    search = DuckDuckGoSearchRun()
    query = f"site:linkedin.com/in/ \"{linkedin_url.split('linkedin.com/in/')[-1].strip('/')}\""
    
    try:
        # Search for the public snippet
        result = search.run(query)
        
        # Basic heuristic parsing of the snippet
        # Snippets usually look like: "John Doe - Software Engineer - Acme Corp | LinkedIn..."
        name = None
        designation = None
        company = None
        
        if result and " - " in result:
            parts = result.split(" - ")
            if len(parts) >= 1:
                name = parts[0].strip()
            if len(parts) >= 2:
                # Sometime designation and company are split by " at " or " - "
                desc = parts[1].strip()
                if " at " in desc.lower():
                    desc_parts = re.split(r'\s+at\s+', desc, flags=re.IGNORECASE)
                    designation = desc_parts[0].strip()
                    company = desc_parts[1].split("|")[0].split("...")[0].strip()
                else:
                    designation = desc.split("|")[0].strip()
                    if len(parts) >= 3:
                        company = parts[2].split("|")[0].strip()
        
        # Clean up company name (remove common suffixes for email domain guessing)
        company_domain = None
        if company:
            clean_company = re.sub(r'[^a-zA-Z0-9]', '', company.lower())
            company_domain = f"{clean_company}.com" # Rough guess, would use Clearbit API in prod
            
        return {
            "full_name": name,
            "designation": designation,
            "company": company,
            "company_domain": company_domain
        }
    except Exception as e:
        print(f"Error extracting profile info: {e}")
        return {
            "full_name": None,
            "designation": None,
            "company": None,
            "company_domain": None
        }
