#!/usr/bin/env python3
"""
Secure local server for Omar's portfolio.
Serves static files with security headers (CSP, nosniff, X-Frame-Options).
Run:  python server.py   (or use start-server.bat)
Open:  http://localhost:8000/
"""
import http.server
import socketserver
import os

PORT = int(os.environ.get("PORT", 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

CSP = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "connect-src 'self' https://formsubmit.co https://script.google.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data:; "
    "style-src 'self' https://fonts.googleapis.com; "
    "script-src 'self'; "
    "upgrade-insecure-requests"
)

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {self.address_string()} {fmt % args}")

class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    with ThreadingServer(("", PORT), SecureHandler) as httpd:
        print(f"Omar Portfolio running at http://localhost:{PORT}/")
        print(f"Hire page: http://localhost:{PORT}/hire.html")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
