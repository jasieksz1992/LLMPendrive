@echo off
setlocal
pushd "%~dp0.."
if exist "runtime\node\node.exe" (
  set "NODE_EXE=runtime\node\node.exe"
) else (
  echo Missing runtime\node\node.exe
  echo Place the Windows Node.js portable files in runtime\node
  popd
  exit /b 1
)
if not exist "app\dist\index.html" (
  echo Missing app\dist\index.html
  echo Build once with app dependencies available, then copy the complete folder to the USB drive
  popd
  exit /b 1
)
start "Portable Code Assistant App" "%NODE_EXE%" "app\server.mjs"
timeout /t 2 /nobreak > nul
start "" "http://127.0.0.1:5173"
popd
endlocal
