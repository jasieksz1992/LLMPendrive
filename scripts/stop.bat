@echo off
taskkill /FI "WINDOWTITLE eq Portable Code Assistant LLM*" /T /F > nul 2> nul
taskkill /FI "WINDOWTITLE eq Portable Code Assistant App*" /T /F > nul 2> nul
echo Portable Code Assistant processes stopped
