# Portable Code Assistant

Portable Code Assistant is a lightweight offline Windows application for generating C# and Java code from a USB drive. It uses a React and Vite frontend, a local portable Node.js runtime, and a local llama.cpp `llama-server.exe` process with a GGUF model.

The application is designed to run without administrator permissions, internet access, Docker, VirtualBox, WSL, Ollama, cloud services, databases, or external API calls.

## Project layout

```text
portable-code-assistant/
├─ app/
├─ runtime/
│  └─ node/
├─ llm/
│  └─ llama-server.exe
├─ models/
│  └─ qwen2.5-coder-1.5b-instruct-q4_k_m.gguf
├─ prompts/
│  ├─ csharp.txt
│  └─ java.txt
├─ workspace/
│  ├─ csharp/
│  └─ java/
├─ scripts/
│  ├─ start-llm.bat
│  ├─ start-app.bat
│  └─ stop.bat
└─ start.bat
```

## What to place on the USB drive

### Node.js portable runtime

Place the extracted Windows Node.js runtime files in:

```text
runtime\node\
```

The launcher expects this executable:

```text
runtime\node\node.exe
```

Use the Windows zip distribution of Node.js. Do not run an installer. Copy the extracted files directly into `runtime\node`.

### llama.cpp server executable

Place the portable llama.cpp server executable in:

```text
llm\
```

The launcher expects this executable:

```text
llm\llama-server.exe
```

Use a Windows build of llama.cpp that includes `llama-server.exe`. No installation is required.

### GGUF model

Place the local GGUF model in:

```text
models\
```

Recommended model:

```text
Qwen2.5-Coder 1.5B Instruct GGUF Q4_K_M
```

The launcher expects this exact file name:

```text
models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf
```


## Download missing LLM files

If `scripts\start-llm.bat` prints that `llm\llama-server.exe` or `models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf` is missing, run this once on a Windows machine with internet access:

```bat
scripts\download-assets.bat
```

The script downloads the latest Windows x64 CPU `llama.cpp` release from GitHub, copies the folder containing `llama-server.exe` into `llm\`, and downloads the recommended Qwen2.5-Coder GGUF model from Hugging Face into `models\`. The model is about 1 GB, so the download can take a while.

Useful options:

```bat
scripts\download-assets.bat -SkipModel
scripts\download-assets.bat -SkipLlama
scripts\download-assets.bat -Force
```

Use `-SkipModel` if you only need `llama-server.exe`, `-SkipLlama` if you only need the GGUF model, and `-Force` to download again even when files already exist.

## Build the web app before offline use

The USB copy should include the built frontend in `app\dist`. Build it once on a machine where the app dependencies are already available.

From the repository root:

```bat
runtime\node\node.exe app\node_modules\vite\bin\vite.js build --config app\vite.config.ts
```

Or, from `app` with Node and npm available:

```bat
npm install
npm run build
```

After building, copy the complete folder to the USB drive, including `app\dist`, `app\server.mjs`, the local runtime, the llama.cpp executable, and the model.

## Start the assistant

From the USB drive, double-click:

```text
start.bat
```

This starts both local services:

```text
llm\llama-server.exe -m models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf --host 127.0.0.1 --port 8080 -c 4096
```

```text
runtime\node\node.exe app\server.mjs
```

The app opens at:

```text
http://127.0.0.1:5173
```

You can also start the services separately:

```text
scripts\start-llm.bat
scripts\start-app.bat
```

Stop both local windows with:

```text
scripts\stop.bat
```

## How to use offline

1. Start the assistant with `start.bat`.
2. Choose `C# generator` or `Java generator`.
3. Enter a task description.
4. Add project context if needed.
5. Paste existing code when refactoring, extending, or generating tests.
6. Choose the output type.
7. Select `Generate code`.
8. Copy the generated code or save it to the local workspace.

Saved files are written to:

```text
workspace\csharp\
workspace\java\
```

All network requests are localhost requests only:

```text
http://127.0.0.1:5173
http://127.0.0.1:8080
```

The app does not need internet after the runtime, executable, model, app files, and built assets are present on the USB drive.

## Prompt templates

Prompt templates are included in:

```text
prompts\csharp.txt
prompts\java.txt
```

The React app also builds a local prompt from the selected language, task description, project context, existing code, output type, and an instruction to return code only unless explanation is requested.

## Small local model limitations

Small local models are useful for quick examples, DTOs, simple services, small refactors, and unit test drafts. They can struggle with large codebases, long context, complex architecture, exact framework APIs, and multi-file changes. Always review generated code before using it in production.

If output quality is too low, try a larger compatible GGUF model if your machine has enough memory, or provide more specific context and smaller tasks.

## No installation and no admin rights

The project uses only relative paths. It does not install services, write to protected folders, require administrator permissions, or depend on Docker, WSL, VirtualBox, Ollama, cloud APIs, a database, or internet access.
