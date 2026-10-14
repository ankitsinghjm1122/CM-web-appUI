<#
.SYNOPSIS
    Provisions and configures a rented AWS EC2 Windows Server for NexusCRM Full-Stack deployment.
.DESCRIPTION
    Installs IIS, URL Rewrite, Application Request Routing (ARR), Python 3.11, NSSM,
    creates the Windows Service for the FastAPI backend, configures the IIS website,
    and sets up firewall rules.
.NOTES
    Must be run as Administrator on the target AWS Windows Server.
#>

[CmdletBinding()]
param (
    [string]$AppRoot = "C:\apps\nexuscrm",
    [string]$SiteName = "NexusCRM",
    [int]$BackendPort = 8001,
    [string]$ServiceName = "NexusCrmBackend"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [NexusCRM DevOps] Initializing AWS Windows Server Setup   " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Verify Administrative Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script must be executed in an elevated PowerShell session (Run as Administrator)."
    exit 1
}

# 2. Install Chocolatey Package Manager (if not already installed)
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "[1/7] Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "[1/7] Chocolatey is already installed." -ForegroundColor Green
}

# 3. Install IIS & Required Features
Write-Host "[2/7] Installing IIS and Management Tools..." -ForegroundColor Yellow
$iisFeatures = @(
    "Web-Server",
    "Web-WebServer",
    "Web-Common-Http",
    "Web-Default-Doc",
    "Web-Dir-Browsing",
    "Web-Http-Errors",
    "Web-Static-Content",
    "Web-Http-Redirect",
    "Web-Health",
    "Web-Http-Logging",
    "Web-Security",
    "Web-Filtering",
    "Web-Performance",
    "Web-Stat-Compression",
    "Web-Mgmt-Tools",
    "Web-Mgmt-Console"
)
Install-WindowsFeature -Name $iisFeatures -IncludeManagementTools | Out-Null
Write-Host "     IIS core features enabled." -ForegroundColor Green

# 4. Install Dependencies (Python, NSSM, URL Rewrite, ARR)
Write-Host "[3/7] Installing URL Rewrite, ARR, Python 3.11, and NSSM..." -ForegroundColor Yellow
choco install -y urlrewrite
choco install -y arr
choco install -y nssm
choco install -y python311 --params "/InstallDir:C:\Python311"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 5. Create Application Directory Structure
Write-Host "[4/7] Creating Application Directory Hierarchy at $AppRoot..." -ForegroundColor Yellow
$dirs = @(
    "$AppRoot\frontend",
    "$AppRoot\backend",
    "$AppRoot\backups",
    "$AppRoot\logs",
    "$AppRoot\scripts"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "     Directories initialized." -ForegroundColor Green

# 6. Configure Python Virtual Environment & Backend Service
Write-Host "[5/7] Setting up Python virtual environment and Windows Service..." -ForegroundColor Yellow
$pythonExe = "C:\Python311\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = (Get-Command python -ErrorAction SilentlyContinue).Source
}

if (-not (Test-Path "$AppRoot\backend\venv")) {
    & $pythonExe -m venv "$AppRoot\backend\venv"
}

# Upgrade pip in venv
& "$AppRoot\backend\venv\Scripts\python.exe" -m pip install --upgrade pip

# Configure Windows Service via NSSM
$serviceExists = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $serviceExists) {
    Write-Host "     Registering Windows Service: $ServiceName" -ForegroundColor Yellow
    nssm install $ServiceName "$AppRoot\backend\venv\Scripts\uvicorn.exe"
    nssm set $ServiceName AppParameters "backend.main:app --host 127.0.0.1 --port $BackendPort --workers 2"
    nssm set $ServiceName AppDirectory "$AppRoot\backend"
    nssm set $ServiceName AppStdout "$AppRoot\logs\backend.stdout.log"
    nssm set $ServiceName AppStderr "$AppRoot\logs\backend.stderr.log"
    nssm set $ServiceName Start SERVICE_AUTO_START
    nssm set $ServiceName AppRotateFiles 1
    nssm set $ServiceName AppRotateOnline 1
    nssm set $ServiceName AppRotateSeconds 86400
    nssm set $ServiceName AppRotateBytes 10485760
} else {
    Write-Host "     Windows Service $ServiceName is already registered." -ForegroundColor Green
}

# 7. Enable ARR Proxy Mode in IIS
Write-Host "[6/7] Enabling Application Request Routing (ARR) Proxy in IIS..." -ForegroundColor Yellow
Import-Module WebAdministration
Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "enabled" -value "True"

# Configure IIS Website
$iisSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if ($iisSite) {
    Set-ItemProperty "IIS:\Sites\$SiteName" -name physicalPath -value "$AppRoot\frontend"
} else {
    # Stop or remove default site if on port 80
    $defaultSite = Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
    if ($defaultSite -and $defaultSite.State -eq "Started") {
        Stop-Website -Name "Default Web Site"
    }
    New-Website -Name $SiteName -Port 80 -PhysicalPath "$AppRoot\frontend" -Force | Out-Null
}

# 8. Configure Windows Firewall
Write-Host "[7/7] Configuring Windows Defender Firewall Rules..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "HTTP Inbound (Port 80)" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
New-NetFirewallRule -DisplayName "HTTPS Inbound (Port 443)" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null

Write-Host "============================================================" -ForegroundColor Green
Write-Host " [NexusCRM DevOps] AWS Windows Server Setup Complete!       " -ForegroundColor Green
Write-Host " App Directory: $AppRoot" -ForegroundColor Green
Write-Host " IIS Site:      $SiteName (Port 80)" -ForegroundColor Green
Write-Host " Backend Serv:  $ServiceName (Port $BackendPort)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
