@echo off
cd /d "%~dp0"
title EL Startup

echo ========================================
echo   EL - Anti-Procrastination Lab
echo ========================================
echo.

echo [1/5] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo   [FAIL] Docker Desktop is not ready!
    echo   Please open Docker Desktop first, wait until whale icon stops spinning.
    pause
    exit /b 1
)
echo   [OK] Docker is running

echo.
echo [2/5] Starting MySQL...
docker rm -f el-mysql >nul 2>&1
docker run -d --name el-mysql -e MYSQL_ROOT_PASSWORD=el123456 -e MYSQL_DATABASE=el_db -p 3307:3306 -v "%~dp0data\mysql":/var/lib/mysql mysql:8.0 >nul 2>&1
echo   [OK] MySQL container started

echo   Waiting for MySQL to be ready...
:wait_mysql
timeout /t 2 /nobreak >nul
docker exec el-mysql mysqladmin ping -uroot -pel123456 --silent >nul 2>&1
if %errorlevel% neq 0 goto wait_mysql
echo   [OK] MySQL is ready

echo.
echo [3/5] Running database migration...
cd /d "%~dp0backend"
call npx prisma migrate deploy
cd /d "%~dp0"

echo.
echo [4/5] Starting backend...
REM Kill any existing backend
taskkill //FI "WINDOWTITLE eq EL-Backend*" //F >nul 2>&1
REM Open in a normal window so you can see if it crashes
start "EL-Backend - DO-NOT-CLOSE" cmd /k "cd /d \"%~dp0backend\" && echo Backend running on port 3000... && node dist\index.js"
timeout /t 3 /nobreak >nul
echo   [OK] Backend started (port 3000)

echo.
echo [5/5] Starting Nginx...
docker rm -f el-nginx >nul 2>&1
docker run -d --name el-nginx -p 80:80 -v "%~dp0deploy\nginx.conf":/etc/nginx/conf.d/default.conf:ro -v "%~dp0frontend\dist":/usr/share/nginx/html:ro nginx:alpine >nul 2>&1
echo   [OK] Nginx started (port 80)

echo.
echo ========================================
echo   [DONE] All services are running!
echo.
echo   Open in browser: http://localhost:80
echo.
echo   !!! DO NOT close the "EL-Backend" window !!!
echo ========================================
echo.
start http://localhost:80
pause
