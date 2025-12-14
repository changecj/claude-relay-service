@echo off
REM ===================================================
REM 代理测试脚本
REM 用途：测试代理是否正常工作
REM ===================================================

echo.
echo ========================================
echo     测试代理连接
echo ========================================
echo.

REM 检查环境变量
if not defined HTTP_PROXY (
    echo [!] 警告: HTTP_PROXY 未设置
    echo [i] 请先运行 set-proxy.bat
    echo.
    pause
    exit /b 1
)

echo [i] 当前代理设置:
echo     HTTP_PROXY  = %HTTP_PROXY%
echo     HTTPS_PROXY = %HTTPS_PROXY%
echo.

echo ========================================
echo     测试 1: 检查代理端口
echo ========================================
echo.
echo [i] 测试 127.0.0.1:7897 是否可连接...
netstat -ano | findstr ":7897" >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 端口 7897 已开放
) else (
    echo [X] 端口 7897 未开放
    echo [!] 请确保代理软件（Clash/V2Ray）正在运行
)
echo.

echo ========================================
echo     测试 2: 访问 Anthropic API
echo ========================================
echo.
echo [i] 正在测试 API 连接...
echo [i] URL: https://api.anthropic.com/v1/messages
echo.

curl -v -X GET "https://api.anthropic.com/v1/messages" 2>&1 | findstr /C:"Connected" /C:"200" /C:"401" /C:"403" /C:"error" /C:"timeout"

echo.
echo ========================================
echo     测试 3: 查看详细连接信息
echo ========================================
echo.
echo [i] 执行详细测试（包含连接过程）...
echo.

curl -v https://api.anthropic.com/v1/messages

echo.
echo ========================================
echo     测试完成
echo ========================================
echo.
echo 说明:
echo - 看到 "Connected to" 和 "200" 或 "401" = 代理成功
echo - 401 Unauthorized 是正常的（没有发送API密钥）
echo - 看到 "timeout" 或 "connection refused" = 代理失败
echo.
pause

