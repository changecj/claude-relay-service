@echo off
REM Claude Relay Service 日志查看脚本

if defined CRS_HOME (
    set "PROJECT_DIR=%CRS_HOME%"
) else (
    set "PROJECT_DIR=D:\gopath\src\github.com\claude-relay-service"
)

if not exist "%PROJECT_DIR%" (
    echo [错误] 项目目录不存在: %PROJECT_DIR%
    exit /b 1
)

cd /d "%PROJECT_DIR%"
call npm run service:logs

