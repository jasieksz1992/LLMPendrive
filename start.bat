@echo off
call "%~dp0npm install"
call "%~dp0scripts\download-assets.bat"
call "%~dp0scripts\start-llm.bat"
call "%~dp0scripts\start-app.bat"
call "%~dp0npm run dev"
