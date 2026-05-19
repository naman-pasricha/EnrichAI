import json
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
import uuid

jobs_db = []
leads_db = {}

class MockAPIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        if self.path == '/api/v1/jobs/':
            self.wfile.write(json.dumps(jobs_db).encode('utf-8'))
            return
        
        if '/leads' in self.path:
            job_id = self.path.split('/')[-2]
            leads = leads_db.get(job_id, [])
            self.wfile.write(json.dumps(leads).encode('utf-8'))
            return
            
        self.wfile.write(b'{"status": "ok"}')

    def do_POST(self):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            self.rfile.read(content_length)
            
        if self.path == '/api/v1/jobs/':
            job_id = str(uuid.uuid4())
            job = {
                "id": job_id,
                "status": "COMPLETED",
                "total_rows": random.randint(5, 15),
                "processed_rows": 0,
                "created_at": "2026-05-19T00:00:00Z"
            }
            jobs_db.insert(0, job)
            
            domains = ["acme.com", "techflow.io", "globalnet.com"]
            firsts = ["John", "Sarah", "Mike", "Emily"]
            lasts = ["Doe", "Smith", "Jones", "Wilson"]
            
            leads = []
            for _ in range(job["total_rows"]):
                f = random.choice(firsts)
                l = random.choice(lasts)
                leads.append({
                    "full_name": f"{f} {l}",
                    "company": random.choice(domains).split('.')[0].capitalize(),
                    "designation": "Executive",
                    "email": f"{f.lower()}.{l.lower()}@{random.choice(domains)}",
                    "phone_number": f"+1 555-{random.randint(1000, 9999)}",
                    "confidence_score": random.randint(70, 99),
                    "validation_status": random.choice(["VALID", "CATCH_ALL", "INVALID"])
                })
            leads_db[job_id] = leads
            
            self.wfile.write(json.dumps(job).encode('utf-8'))

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), MockAPIHandler)
    print("Starting mock API server on port 8000...")
    server.serve_forever()
