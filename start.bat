@echo off
title ShopKart Launcher
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js install nahi hai. https://nodejs.org se LTS version install karein, phir dobara chalayein.
  pause
  exit /b
)

findstr /C:"PASTE_YOUR_MONGODB" server\.env >nul
if %errorlevel%==0 (
  echo.
  echo  server\.env me MONGO_URI abhi set nahi hai.
  echo  Notepad khul raha hai: PASTE_YOUR_MONGODB_ATLAS_STRING_HERE ki jagah apni Atlas string likhein,
  echo  Save karein, phir start.bat dobara chalayein.
  notepad server\.env
  pause
  exit /b
)

if not exist server\node_modules (echo Installing server packages... & cd server & call npm install & cd ..)
if not exist client\node_modules (echo Installing client packages... & cd client & call npm install & cd ..)

if not exist server\.seeded-v2 (
  echo Seeding database with demo data...
  cd server & call npm run seed && echo done> .seeded-v2 & cd ..
)

start "ShopKart Backend" cmd /k "cd /d %~dp0server && npm run dev"
start "ShopKart Frontend" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 6 >nul
start http://localhost:5173
echo.
echo  Store:     http://localhost:5173
echo  Dashboard: http://localhost:5173/admin
echo  Admin: admin@shopkart.com / admin123
echo  User : user@shopkart.com / user123
echo.
echo  Database reset karna ho to:  cd server ^&^& npm run seed
pause
