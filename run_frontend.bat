@echo off
echo ====================================================
echo Starting CareBridge AI Frontend (React + Vite)...
echo ====================================================
cd /d "%~dp0frontend"
cmd.exe /c npm run dev -- --host 127.0.0.1 --port 5173
pause
