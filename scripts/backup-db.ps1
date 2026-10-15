<#
.SYNOPSIS
    Automated Daily Backup Script for NexusCRM MariaDB/MySQL Database.
.DESCRIPTION
    Dumps the 'nexuscrm' database, compresses it to ZIP, logs execution,
    and rotates/deletes backups older than 14 days.
#>

param(
    [string]$DbUser = "root",
    [string]$DbPassword = "NexusRoot2026!",
    [string]$DbName = "nexuscrm",
    [string]$BackupDir = "C:\apps\nexuscrm\backups",
    [string]$LogFile = "C:\apps\nexuscrm\logs\backup.log",
    [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

# Ensure directories exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}
$logDir = Split-Path -Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$sqlFile = Join-Path $BackupDir "$($DbName)_backup_$timestamp.sql"
$zipFile = Join-Path $BackupDir "$($DbName)_backup_$timestamp.zip"

function Log-Message([string]$msg) {
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formatted = "[$now] $msg"
    Write-Host $formatted
    Add-Content -Path $LogFile -Value $formatted
}

Log-Message "Starting database backup for '$DbName'..."

# Find mysqldump or mariadb-dump
$dumpCmd = Get-Command "mysqldump" -ErrorAction SilentlyContinue
if (-not $dumpCmd) {
    $dumpCmd = Get-Command "mariadb-dump" -ErrorAction SilentlyContinue
}
if (-not $dumpCmd) {
    $found = Get-ChildItem -Path "C:\Program Files\MariaDB*" -Filter "mariadb-dump.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $found) {
        $found = Get-ChildItem -Path "C:\Program Files\MariaDB*" -Filter "mysqldump.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    if ($found) {
        $dumpCmd = $found.FullName
    }
}

if (-not $dumpCmd) {
    Log-Message "ERROR: Neither mysqldump nor mariadb-dump executable could be found on the system."
    exit 1
}

$dumpExecutable = if ($dumpCmd -is [string]) { $dumpCmd } else { $dumpCmd.Source }
Log-Message "Using dump binary: $dumpExecutable"

# Execute dump
$dumpArgs = @(
    "-u$DbUser",
    "-p$DbPassword",
    "--single-transaction",
    "--routines",
    "--triggers",
    "--result-file=$sqlFile",
    $DbName
)

& $dumpExecutable $dumpArgs

if (-not (Test-Path $sqlFile) -or (Get-Item $sqlFile).Length -eq 0) {
    Log-Message "ERROR: Database dump produced empty or missing file."
    exit 1
}

$sqlSize = (Get-Item $sqlFile).Length
Log-Message "Raw dump created: $sqlFile ($([math]::Round($sqlSize / 1KB, 2)) KB)"

# Compress to ZIP
Compress-Archive -Path $sqlFile -DestinationPath $zipFile -CompressionLevel Optimal -Force
Remove-Item -Path $sqlFile -Force

$zipSize = (Get-Item $zipFile).Length
Log-Message "Compressed backup saved: $zipFile ($([math]::Round($zipSize / 1KB, 2)) KB)"

# Rotation: Remove backups older than RetentionDays
$limitDate = (Get-Date).AddDays(-$RetentionDays)
$purgedCount = 0
Get-ChildItem -Path $BackupDir -Filter "$($DbName)_backup_*.zip" | Where-Object { $_.LastWriteTime -lt $limitDate } | ForEach-Object {
    Log-Message "Purging old backup: $($_.Name)"
    Remove-Item $_.FullName -Force
    $purgedCount++
}

Log-Message "Backup completed successfully! (Purged $purgedCount old archives)"
