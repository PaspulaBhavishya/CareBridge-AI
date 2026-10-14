@echo off
echo ==========================================================
echo Starting CareBridge AI Full-Stack Platform...
echo ==========================================================
start "CareBridge AI Backend" "%~dp0run_backend.bat"
ping 127.0.0.1 -n 3 >nul
start "CareBridge AI Frontend" "%~dp0run_frontend.bat"
echo CareBridge AI launched successfully!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
echo ==========================================================
