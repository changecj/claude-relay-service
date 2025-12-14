@echo off
REM Claude Relay Service 启动脚本
REM 使用方法：将本脚本放到 PATH 环境变量中的任意目录，然后可以在任何地方执行 crs-start

REM 设置项目路径（优先使用环境变量，否则使用默认路径）
if defined CRS_HOME (
    set "PROJECT_DIR=%CRS_HOME%"
) else (
    REM 默认项目路径（根据你的实际路径修改）
    set "PROJECT_DIR=D:\gopath\src\github.com\claude-relay-service"
)

REM 检查项目目录是否存在
if not exist "%PROJECT_DIR%" (
    echo [错误] 项目目录不存在: %PROJECT_DIR%
    echo [提示] 请设置环境变量 CRS_HOME 指向正确的项目路径
    echo [提示] 例如: setx CRS_HOME "D:\gopath\src\github.com\claude-relay-service"
    pause
    exit /b 1
)

REM 切换到项目目录
cd /d "%PROJECT_DIR%"

REM 检查 package.json 是否存在（确认是项目目录）
if not exist "package.json" (
    echo [错误] 在 %PROJECT_DIR% 中未找到 package.json
    echo [提示] 请确认项目路径是否正确
    pause
    exit /b 1
)

REM 执行重启服务命令
echo [信息] 正在重启 Claude Relay Service...
echo [信息] 项目目录: %PROJECT_DIR%
echo.

call npm run service:restart:daemon

REM 检查执行结果
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] 服务重启命令已执行
) else (
    echo.
    echo [错误] 服务重启失败，错误代码: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

