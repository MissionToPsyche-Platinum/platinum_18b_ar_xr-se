#Requires -Version 5
param(
  [switch]$Dev
)

$ErrorActionPreference = "Stop"

Write-Host "==> Psyche bootstrap (Windows)" -ForegroundColor Cyan

# Paths
$ProjectDir = (Resolve-Path "$PSScriptRoot\..").Path
$PsycheDir  = Join-Path $ProjectDir "psyche"

function Need-Cmd($name) {
  $exists = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $exists) {
    return $false
  }
  return $true
}

if (-not (Need-Cmd "winget")) {
  Write-Host "ERROR: winget not found. Please update to a recent Windows 10/11 or install winget." -ForegroundColor Red
  exit 1
}

if (-not (Need-Cmd "git")) {
  Write-Host "==> Installing Git via winget..."
  winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
}

if (-not (Need-Cmd "node")) {
  Write-Host "==> Installing Node.js LTS via winget..."
  winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

$nodeVer = (& node -v)
$npmVer  = (& npm -v)
Write-Host "==> Using Node $nodeVer, npm $npmVer"

if (Get-Command corepack -ErrorAction SilentlyContinue) {
  try { corepack enable | Out-Null } catch {}
}

if (-not (Test-Path $PsycheDir)) {
  Write-Host "ERROR: Expected '$PsycheDir' but it doesn't exist." -ForegroundColor Red
  Write-Host "Create the Astro app at repo/psyche first (npm create astro@latest psyche)."
  exit 1
}

Set-Location $PsycheDir

if (Test-Path "package-lock.json") {
  npm ci
} else {
  npm install
}

try {
  $pkg = Get-Content package.json -Raw | ConvertFrom-Json
  if (-not $pkg.devDependencies.PSObject.Properties.Name.Contains("astro")) {
    Write-Host "==> Adding Astro (dev dependency) ..."
    npm install -D astro
  }
} catch {
  Write-Host "WARNING: Could not parse package.json; skipping Astro check."
}

try {
  npm run predev | Out-Null
} catch {}

if ($Dev) {
  Write-Host "==> Starting dev server (Ctrl+C to stop) ..."
  npm run dev
} else {
  Write-Host "==> Bootstrap complete."
  Write-Host "Next steps:"
  Write-Host "  cd psyche"
  Write-Host "  npm run dev"
}
