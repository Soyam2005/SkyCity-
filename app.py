"""
SkyCity DineMetrics — Application Server & Live Data Sync Engine
Serves the web dashboard, auto-synchronizes CSV updates, provides API endpoints, and opens the browser.
"""
import os
import sys
import json
import webbrowser
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT_DIR = Path(__file__).resolve().parent
WEB_DIR = ROOT_DIR / "web"
DATA_FILE = ROOT_DIR / "data" / "SkyCity_Auckland_Restaurants___Bars.csv"
REPORTS_DIR = ROOT_DIR / "reports"
PORT = 8000

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.export_data_js import sync_data_js, build_data_payload

_LAST_CSV_MTIME = 0

def check_and_sync_csv():
    """Checks if the raw CSV was modified and updates data.js automatically."""
    global _LAST_CSV_MTIME
    if DATA_FILE.exists():
        current_mtime = DATA_FILE.stat().st_mtime
        if current_mtime != _LAST_CSV_MTIME:
            try:
                sync_data_js()
                _LAST_CSV_MTIME = current_mtime
                print(f"[DATA SYNC] Synchronized latest CSV data to web/js/data.js (mtime: {current_mtime})")
            except Exception as e:
                print(f"[DATA SYNC ERROR] Could not sync CSV: {e}")

class CustomHTTPHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler serving web/ files and live analytical API endpoints."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        # Auto-check CSV sync on every request
        check_and_sync_csv()
        
        # API Routes
        if self.path in ("/api/data", "/api/data/"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            payload = build_data_payload()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
            return

        elif self.path == "/api/reload":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            sync_data_js()
            self.wfile.write(json.dumps({"status": "success", "message": "Data reloaded and synced successfully"}).encode("utf-8"))
            return

        elif self.path in ("/api/reports/research-paper", "/api/reports/research_paper"):
            self.send_response(200)
            self.send_header("Content-Type", "text/markdown; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            rp_path = REPORTS_DIR / "research_paper.md"
            content = rp_path.read_text(encoding="utf-8") if rp_path.exists() else "# Research Paper not found"
            self.wfile.write(content.encode("utf-8"))
            return

        elif self.path in ("/api/reports/executive-summary", "/api/reports/executive_summary"):
            self.send_response(200)
            self.send_header("Content-Type", "text/markdown; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            es_path = REPORTS_DIR / "executive_summary.md"
            content = es_path.read_text(encoding="utf-8") if es_path.exists() else "# Executive Summary not found"
            self.wfile.write(content.encode("utf-8"))
            return

        # Serve static web files
        super().do_GET()

    def log_message(self, format, *args):
        # Clean console log format
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")

def main():
    if not WEB_DIR.exists():
        print(f"Error: Web directory not found at {WEB_DIR}")
        sys.exit(1)

    # Initial sync
    check_and_sync_csv()

    url = f"http://localhost:{PORT}"
    
    print("=" * 70)
    print("SkyCity DineMetrics - Order Channel Analytics Server")
    print("=" * 70)
    print(f"Serving Web Dashboard from: {WEB_DIR}")
    print(f"Live Data API Endpoint    : {url}/api/data")
    print(f"Auto-Sync CSV File        : {DATA_FILE}")
    print(f"Local URL                 : {url}")
    print("Press Ctrl + C to stop the server at any time.")
    print("=" * 70)

    # Automatically open browser
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

    # Start HTTP Server
    try:
        server = HTTPServer(("0.0.0.0", PORT), CustomHTTPHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped gracefully. Goodbye!")
    except Exception as e:
        print(f"\nError starting server on port {PORT}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
