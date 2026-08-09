@echo off
cd /d "%~dp0"
echo Starting secure local server for Omar's portfolio...
echo Open: http://localhost:8000/
echo (Hire page: http://localhost:8000/hire.html)
echo Security headers: CSP (frame-ancestors 'none'), nosniff, X-Frame-Options DENY
echo Press Ctrl+C to stop.
python server.py
pause
