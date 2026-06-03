@echo off
setlocal
pushd "%~dp0.."
if not exist "llm\llama-server.exe" (
  echo Missing llm\llama-server.exe
  popd
  exit /b 1
)
if not exist "models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf" (
  echo Missing models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf
  popd
  exit /b 1
)
start "Portable Code Assistant LLM" "llm\llama-server.exe" -m "models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf" --host 127.0.0.1 --port 8080 -c 4096
popd
endlocal
