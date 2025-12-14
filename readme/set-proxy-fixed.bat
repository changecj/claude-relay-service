@echo off
REM ===================================================
REM Windows 代理设置脚本
REM 用途：为当前CMD窗口设置HTTP/HTTPS代理
REM ===================================================

echo.
echo ========================================
echo     设置代理到 127.0.0.1:7897
echo ========================================
echo.

REM 设置HTTP代理
set HTTP_PROXY=http://127.0.0.1:7897
set http_proxy=http://127.0.0.1:7897

REM 设置HTTPS代理
set HTTPS_PROXY=http://127.0.0.1:7897
set https_proxy=http://127.0.0.1:7897

echo [√] HTTP 代理已设置:  %HTTP_PROXY%
echo [√] HTTPS 代理已设置: %HTTPS_PROXY%
echo.
echo ========================================
echo     验证代理设置
echo ========================================
echo.
echo 当前环境变量：
echo HTTP_PROXY  = %HTTP_PROXY%
echo HTTPS_PROXY = %HTTPS_PROXY%
echo.

REM 保持CMD窗口打开，以便继续使用
echo ========================================
echo 提示：
echo 1. 代理已设置，仅在当前窗口有效
echo 2. 现在可以运行需要代理的命令了
echo 3. 测试命令：curl https://api.anthropic.com/v1/messages
echo ========================================
echo.

REM 启动一个新的CMD会话，继承当前环境变量
cmd /k

