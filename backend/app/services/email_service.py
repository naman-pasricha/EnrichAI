import dns.resolver
import smtplib
import socket
from typing import Tuple, List

# Basic patterns for email permutation
EMAIL_PATTERNS = [
    "{first}@{domain}",
    "{first}.{last}@{domain}",
    "{f}{last}@{domain}",
    "{first}{l}@{domain}",
    "{first}{last}@{domain}"
]

def generate_email_permutations(first_name: str, last_name: str, domain: str) -> List[str]:
    """Generate probable email addresses based on common corporate patterns."""
    first = first_name.lower().strip()
    last = last_name.lower().strip()
    domain = domain.lower().strip()
    
    if not first or not domain:
        return []

    f = first[0] if first else ""
    l = last[0] if last else ""

    permutations = []
    for pattern in EMAIL_PATTERNS:
        email = pattern.format(first=first, last=last, f=f, l=l, domain=domain)
        if email not in permutations:
            permutations.append(email)
            
    return permutations

def get_mx_records(domain: str) -> List[str]:
    """Retrieve MX records for a domain."""
    try:
        records = dns.resolver.resolve(domain, 'MX')
        mx_records = [record.exchange.to_text() for record in records]
        # Sort by preference (implied by DNS response order, but typically we just take the first)
        return mx_records
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.exception.Timeout):
        return []

def check_catch_all(domain: str, mx_record: str) -> bool:
    """Check if the domain has a catch-all policy."""
    catch_all_email = f"test-random-catchall-12345@{domain}"
    status, _ = verify_email_smtp(catch_all_email, mx_record)
    return status == "VALID"

def verify_email_smtp(email: str, mx_record: str) -> Tuple[str, float]:
    """
    Perform SMTP handshake to verify email existence.
    Returns: Tuple[Status ("VALID", "INVALID", "UNKNOWN"), Confidence Score]
    """
    try:
        # SMTP connection
        server = smtplib.SMTP(timeout=5)
        server.set_debuglevel(0)
        
        server.connect(mx_record)
        server.helo(server.local_hostname)
        
        # Sender email (use a generic no-reply or domain email in production)
        server.mail('hello@enrichai.local')
        
        # Recipient email
        code, message = server.rcpt(str(email))
        server.quit()

        # 250 Requested mail action okay, completed
        if code == 250:
            return "VALID", 95.0
        # 550 Requested action not taken: mailbox unavailable
        elif code == 550:
            return "INVALID", 10.0
        else:
            return "UNKNOWN", 50.0

    except (socket.error, smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, smtplib.SMTPHeloError):
        return "UNKNOWN", 50.0
