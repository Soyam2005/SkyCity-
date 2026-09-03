"""
SkyCity DineMetrics — Application Server Entrypoint
Serves the web dashboard and automatically opens it in your default web browser.
"""
import os
import sys
import webbrowser
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT_DIR = Path(__file__).resolve().parent
WEB_DIR = ROOT_DIR / "web"
PORT = 8000

class CustomHTTPHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler serving files strictly from the web/ directory."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def log_message(self, format, *args):
        # Clean console log format
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")

def main():
    if not WEB_DIR.exists():
        print(f"Error: Web directory not found at {WEB_DIR}")
        sys.exit(1)

    url = f"http://localhost:{PORT}"
    
    print("=" * 65)
    print("🍽️  SkyCity DineMetrics — Order Channel Analytics Server")
    print("=" * 65)
    print(f"🚀 Serving web app from : {WEB_DIR}")
    print(f"🌐 Local URL            : {url}")
    print("📌 Press Ctrl + C to stop the server at any time.")
    print("=" * 65)

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
        print("\n🛑 Server stopped gracefully. Goodbye!")
    except Exception as e:
        print(f"\n❌ Error starting server on port {PORT}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
