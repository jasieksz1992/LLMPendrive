[CmdletBinding()]
param(
  [switch]$SkipLlama,
  [switch]$SkipModel,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$LlmDir = Join-Path $RepoRoot 'llm'
$ModelsDir = Join-Path $RepoRoot 'models'
$TempDir = Join-Path $RepoRoot '.download-temp'
$LlamaServerPath = Join-Path $LlmDir 'llama-server.exe'
$ModelFileName = 'qwen2.5-coder-1.5b-instruct-q4_k_m.gguf'
$ModelPath = Join-Path $ModelsDir $ModelFileName
$ModelUrl = 'https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf?download=true'
function Write-Step {
  param([string]$Message)
  Write-Host "==> $Message"
}

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Download-File {
  param(
    [string]$Uri,
    [string]$OutFile
  )

  $parent = Split-Path -Parent $OutFile
  Ensure-Directory $parent

  if (Test-Path $OutFile) {
    Remove-Item $OutFile -Force
  }

  Write-Host "Downloading: $Uri"
  Write-Host "Saving to:   $OutFile"
  Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing
}

function Install-LlamaServer {
  if ((Test-Path $LlamaServerPath) -and -not $Force) {
    Write-Step "llm\\llama-server.exe already exists; skipping llama.cpp download. Use -Force to download again."
    return
  }

  Write-Step 'Looking up the latest llama.cpp Windows CPU release on GitHub'
  $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/ggml-org/llama.cpp/releases/latest' -Headers @{ 'User-Agent' = 'Portable-Code-Assistant-setup' }
  $asset = $release.assets |
    Where-Object { $_.name -match '^llama-b.+-bin-win-cpu-x64\.zip$' } |
    Select-Object -First 1

  if (-not $asset) {
    $asset = $release.assets |
      Where-Object { $_.name -match '^llama-b.+-bin-win-avx2-x64\.zip$' } |
      Select-Object -First 1
  }

  if (-not $asset) {
    throw 'Could not find a Windows x64 CPU llama.cpp zip in the latest GitHub release.'
  }

  Ensure-Directory $TempDir
  $zipPath = Join-Path $TempDir $asset.name
  $extractDir = Join-Path $TempDir 'llama-cpp'

  if (Test-Path $extractDir) {
    Remove-Item $extractDir -Recurse -Force
  }

  Download-File -Uri $asset.browser_download_url -OutFile $zipPath

  Write-Step 'Extracting llama.cpp'
  Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

  $server = Get-ChildItem -Path $extractDir -Filter 'llama-server.exe' -Recurse -File | Select-Object -First 1
  if (-not $server) {
    throw 'Downloaded llama.cpp archive does not contain llama-server.exe.'
  }

  Ensure-Directory $LlmDir
  Write-Step "Copying llama.cpp binaries to $LlmDir"
  Copy-Item -Path (Join-Path $server.DirectoryName '*') -Destination $LlmDir -Recurse -Force

  if (-not (Test-Path $LlamaServerPath)) {
    throw 'llama-server.exe was not copied to llm directory.'
  }
}

function Install-Model {
  if ((Test-Path $ModelPath) -and -not $Force) {
    Write-Step "models\\$ModelFileName already exists; skipping model download. Use -Force to download again."
    return
  }

  Ensure-Directory $ModelsDir
  Download-File -Uri $ModelUrl -OutFile $ModelPath
}

Push-Location $RepoRoot
try {
  if (-not $SkipLlama) {
    Install-LlamaServer
  }

  if (-not $SkipModel) {
    Install-Model
  }

  Write-Step 'Done. You can now run start.bat or scripts\\start-llm.bat.'
}
finally {
  Pop-Location
}
