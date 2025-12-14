@echo off
chcp 936 >nul
REM ===================================================
REM �������Խű�
REM ��;�����Դ����Ƿ���������
REM ===================================================

echo.
echo ========================================
echo     ���Դ�������
echo ========================================
echo.

REM ��黷������
if not defined HTTP_PROXY (
    echo [!] ����: HTTP_PROXY δ����
    echo [i] �������� set-proxy.bat
    echo.
    pause
    exit /b 1
)

echo [i] ��ǰ��������:
echo     HTTP_PROXY  = %HTTP_PROXY%
echo     HTTPS_PROXY = %HTTPS_PROXY%
echo.

echo ========================================
echo     ���� 1: �������˿�
echo ========================================
echo.
echo [i] ���� 127.0.0.1:7897 �Ƿ������...
netstat -ano | findstr ":7897" >nul 2>&1
if %errorlevel% == 0 (
    echo [��] �˿� 7897 �ѿ���
) else (
    echo [X] �˿� 7897 δ����
    echo [!] ��ȷ������������Clash/V2Ray����������
)
echo.

echo ========================================
echo     ���� 2: ���� Anthropic API
echo ========================================
echo.
echo [i] ���ڲ��� API ����...
echo [i] URL: https://api.anthropic.com/v1/messages
echo.

curl -v -X GET "https://api.anthropic.com/v1/messages" 2>&1 | findstr /C:"Connected" /C:"200" /C:"401" /C:"403" /C:"error" /C:"timeout"

echo.
echo ========================================
echo     ���� 3: �鿴��ϸ������Ϣ
echo ========================================
echo.
echo [i] ִ����ϸ���ԣ��������ӹ��̣�...
echo.

curl -v https://api.anthropic.com/v1/messages

echo.
echo ========================================
echo     �������
echo ========================================
echo.
echo ˵��:
echo - ���� "Connected to" �� "200" �� "401" = �����ɹ�
echo - 401 Unauthorized �������ģ�û�з���API��Կ��
echo - ���� "timeout" �� "connection refused" = ����ʧ��
echo.
pause
