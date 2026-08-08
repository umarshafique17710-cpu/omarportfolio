@echo off
cd /d "%~dp0"
echo Starting local server for Omar's portfolio...
echo Open: http://localhost:8000/index.html
echo (Hire page: http://localhost:8000/hire.html)
echo Press Ctrl+C to stop.
python -m http.server 8000
pause
