@echo off
setlocal
pushd "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\download-assets.ps1" %*
set "EXITCODE=%ERRORLEVEL%"
popd
exit /b %EXITCODE%
