<#
.SYNOPSIS
    Automated zero-downtime deployment script for NexusCRM on AWS EC2 Windows Server.
.DESCRIPTION
    Performs pre-deployment backup, atomic extraction, backend package updates,
    service restart, automated health checks, and triggers instant rollback on failure.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$ArtifactZipPath,

    [string]$AppRoot = "C:\apps\nexuscrm",
    [string]$ServiceName = "NexusCrmBackend",
    [string]$HealthCheckUrl = "http://127.0.0.1:8001/api/health",
    [string]$FrontendHealthUrl = "http://localhost/",
    [int]$MaxHealthRetries = 10,
    [int]$RetryIntervalSec = 3
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "$AppRoot\backups\release-$timestamp"
$stagingDir = "$AppRoot\staging-$timestamp"
$logFile = "$AppRoot\logs\deploy-$timestamp.log"

function Write-DeployLog([string]$msg, [string]$color = "White") {
    $formatted = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Write-Host $formatted -ForegroundColor $color
    Add-Content -Path $logFile -Value $formatted -ErrorAction SilentlyContinue
}

Write-DeployLog "============================================================" "Cyan"
Write-DeployLog " [NexusCRM DevOps] Deploying Artifact: $ArtifactZipPath" "Cyan"
Write-DeployLog "============================================================" "Cyan"

try {
    # 1. Validate Artifact
    if (-not (Test-Path $ArtifactZipPath)) {
        throw "Artifact zip not found at: $ArtifactZipPath"
    }

    # 2. Extract Artifact to Staging
    Write-DeployLog "[1/6] Extracting artifact to staging folder: $stagingDir..." "Yellow"
    New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null
    Expand-Archive -Path $ArtifactZipPath -DestinationPath $stagingDir -Force
    Write-DeployLog "     Extraction complete." "Green"

    # 3. Create Automated Rollback Backup
    Write-DeployLog "[2/6] Backing up current production state to $backupDir..." "Yellow"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

    if (Test-Path "$AppRoot\frontend") {
        Copy-Item -Path "$AppRoot\frontend" -Destination "$backupDir\frontend" -Recurse -Force
    }
    if (Test-Path "$AppRoot\backend") {
        # Exclude venv and pycache from backup to save space and time
        New-Item -ItemType Directory -Path "$backupDir\backend" -Force | Out-Null
        Get-ChildItem -Path "$AppRoot\backend" -Exclude "venv", "__pycache__", "*.pyc" | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "$backupDir\backend" -Recurse -Force
        }
    }
    # Keep only the last 5 backups
    Get-ChildItem -Path "$AppRoot\backups" | Sort-Object CreationTime -Descending | Select-Object -Skip 5 | Remove-Item -Recurse -Force
    Write-DeployLog "     Backup successfully created." "Green"

    # 4. Deploy Frontend
    Write-DeployLog "[3/6] Deploying frontend static bundle to $AppRoot\frontend..." "Yellow"
    if (Test-Path "$stagingDir\dist") {
        Copy-Item -Path "$stagingDir\dist\*" -Destination "$AppRoot\frontend" -Recurse -Force
    } elseif (Test-Path "$stagingDir\index.html") {
        Copy-Item -Path "$stagingDir\*" -Destination "$AppRoot\frontend" -Recurse -Force
    } else {
        throw "Could not locate compiled frontend assets in the release package."
    }
    Write-DeployLog "     Frontend files synced." "Green"

    # 5. Deploy Backend & Update Dependencies
    Write-DeployLog "[4/6] Updating FastAPI backend files and dependencies..." "Yellow"
    if (Test-Path "$stagingDir\backend") {
        Get-ChildItem -Path "$stagingDir\backend" -Exclude "__pycache__", "*.pyc" | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "$AppRoot\backend" -Recurse -Force
        }
    }

    $venvPip = "$AppRoot\backend\venv\Scripts\pip.exe"
    if (Test-Path $venvPip) {
        if (Test-Path "$AppRoot\backend\requirements.txt") {
            Write-DeployLog "     Installing updated Python dependencies..." "Yellow"
            & $venvPip install -r "$AppRoot\backend\requirements.txt" --no-warn-script-location --quiet
        }
    } else {
        Write-DeployLog "     WARNING: Virtual environment not found at $venvPip. Creating now..." "Magenta"
        python -m venv "$AppRoot\backend\venv"
        & "$AppRoot\backend\venv\Scripts\pip.exe" install -r "$AppRoot\backend\requirements.txt" --quiet
    }
    Write-DeployLog "     Backend dependencies up to date." "Green"

    # 6. Restart Backend Service & Recycle IIS
    Write-DeployLog "[5/6] Restarting Windows Service '$ServiceName' and IIS..." "Yellow"
    Restart-Service -Name $ServiceName -Force
    
    # Recycle IIS Application Pool
    try {
        Import-Module WebAdministration
        Restart-WebAppPool -Name "NexusCRM" -ErrorAction SilentlyContinue
    } catch {
        Write-DeployLog "     Note: WebAdministration module not available or pool not defined." "Gray"
    }

    # 7. Automated Health Checks with Retries
    Write-DeployLog "[6/6] Executing Automated Post-Deployment Health Checks..." "Yellow"
    $backendHealthy = $false

    for ($i = 1; $i -le $MaxHealthRetries; $i++) {
        Write-DeployLog "     Attempt $i of $MaxHealthRetries: Probing $HealthCheckUrl..." "Gray"
        try {
            $response = Invoke-RestMethod -Uri $HealthCheckUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
            if ($response.status -eq "healthy" -or $response.status -eq "online") {
                $backendHealthy = $true
                Write-DeployLog "     Backend Health Check: PASSED (Status: $($response.status))" "Green"
                break
            }
        } catch {
            Start-Sleep -Seconds $RetryIntervalSec
        }
    }

    if (-not $backendHealthy) {
        throw "Backend health check failed after $MaxHealthRetries attempts."
    }

    # Clean up staging folder
    Remove-Item -Path $stagingDir -Recurse -Force -ErrorAction SilentlyContinue

    Write-DeployLog "============================================================" "Green"
    Write-DeployLog " [NexusCRM DevOps] DEPLOYMENT SUCCESSFUL!                  " "Green"
    Write-DeployLog " Released at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')    " "Green"
    Write-DeployLog " Backup tag:  release-$timestamp                          " "Green"
    Write-DeployLog "============================================================" "Green"
    exit 0

} catch {
    Write-DeployLog "❌ DEPLOYMENT FAILED: $_" "Red"
    Write-DeployLog " Initiating automated emergency rollback to $backupDir..." "Red"

    # Execute Rollback
    $rollbackScript = "$PSScriptRoot\rollback.ps1"
    if (Test-Path $rollbackScript) {
        & $rollbackScript -BackupDir $backupDir -AppRoot $AppRoot -ServiceName $ServiceName
    } else {
        Write-DeployLog "CRITICAL: Rollback script not found at $rollbackScript!" "Red"
    }

    # Clean up staging
    if (Test-Path $stagingDir) {
        Remove-Item -Path $stagingDir -Recurse -Force -ErrorAction SilentlyContinue
    }

    exit 1
}
