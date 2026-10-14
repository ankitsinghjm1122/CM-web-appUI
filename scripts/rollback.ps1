<#
.SYNOPSIS
    Automated rollback script for NexusCRM on AWS Windows Server.
.DESCRIPTION
    Restores the specified backup directory to production, restarts the service, and verifies health.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupDir,

    [string]$AppRoot = "C:\apps\nexuscrm",
    [string]$ServiceName = "NexusCrmBackend",
    [string]$HealthCheckUrl = "http://127.0.0.1:8001/api/health"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Red
Write-Host " [NexusCRM DevOps] EXECUTING EMERGENCY ROLLBACK             " -ForegroundColor Red
Write-Host " Restoring from: $BackupDir" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Red

if (-not (Test-Path $BackupDir)) {
    Write-Error "CRITICAL: Backup directory does not exist: $BackupDir"
    exit 2
}

try {
    # 1. Restore Frontend
    if (Test-Path "$BackupDir\frontend") {
        Write-Host "-> Restoring frontend assets..." -ForegroundColor Yellow
        Copy-Item -Path "$BackupDir\frontend\*" -Destination "$AppRoot\frontend" -Recurse -Force
        Write-Host "   Frontend restored." -ForegroundColor Green
    }

    # 2. Restore Backend
    if (Test-Path "$BackupDir\backend") {
        Write-Host "-> Restoring backend files..." -ForegroundColor Yellow
        Copy-Item -Path "$BackupDir\backend\*" -Destination "$AppRoot\backend" -Recurse -Force
        Write-Host "   Backend restored." -ForegroundColor Green
    }

    # 3. Restart Windows Service
    Write-Host "-> Restarting service $ServiceName..." -ForegroundColor Yellow
    Restart-Service -Name $ServiceName -Force
    Start-Sleep -Seconds 5

    # 4. Verify Rollback Health
    Write-Host "-> Verifying rollback health check..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $HealthCheckUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "healthy" -or $response.status -eq "online") {
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host " [NexusCRM DevOps] ROLLBACK SUCCESSFUL! Previous version restored." -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        exit 0
    } else {
        throw "Service returned unexpected status: $($response.status)"
    }
} catch {
    Write-Error "CRITICAL: Rollback failed! System needs manual intervention: $_"
    exit 3
}
