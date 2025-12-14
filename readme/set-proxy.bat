@echo off
chcp 936 >nul
REM ===================================================
REM Windows �������ýű�
REM ��;��Ϊ��ǰCMD��������HTTP/HTTPS����
REM ===================================================

echo.
echo ========================================
echo     ���ô����� 127.0.0.1:7897
echo ========================================
echo.

REM ����HTTP����
set HTTP_PROXY=http://127.0.0.1:7897
set http_proxy=http://127.0.0.1:7897

REM ����HTTPS����
set HTTPS_PROXY=http://127.0.0.1:7897
set https_proxy=http://127.0.0.1:7897

echo [��] HTTP ����������:  %HTTP_PROXY%
echo [��] HTTPS ����������: %HTTPS_PROXY%
echo.
echo ========================================
echo     ��֤��������
echo ========================================
echo.
echo ��ǰ����������
echo HTTP_PROXY  = %HTTP_PROXY%
echo HTTPS_PROXY = %HTTPS_PROXY%
echo.

REM ����CMD���ڴ򿪣��Ա����ʹ��
echo ========================================
echo ��ʾ��
echo 1. ���������ã����ڵ�ǰ������Ч
echo 2. ���ڿ���������Ҫ������������
echo 3. �������curl https://api.anthropic.com/v1/messages
echo ========================================
echo.

REM ����һ���µ�CMD�Ự���̳е�ǰ��������
cmd /k
