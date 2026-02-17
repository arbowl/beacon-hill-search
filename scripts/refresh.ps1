# refresh.ps1
# Run from repository root to regenerate the SQLite presentation database
# from bill_artifacts.db and restart the Next.js dev server if running.
#
# Usage:
#   .\scripts\refresh.ps1
#   .\scripts\refresh.ps1 -Restart   # also kills and restarts npm run dev

param(
    [switch]$Restart
)

$root = Split-Path -Parent $PSScriptRoot
$script = Join-Path $root "scripts\export_sqlite.py"
$webDir = Join-Path $root "apps\web"

Write-Host "==> Regenerating archive.db from bill_artifacts.db..." -ForegroundColor Cyan
python $script

if ($LASTEXITCODE -ne 0) {
    Write-Host "Export failed. Check Python output above." -ForegroundColor Red
    exit 1
}

Write-Host "==> Done." -ForegroundColor Green

if ($Restart) {
    Write-Host "==> Restarting Next.js dev server..." -ForegroundColor Cyan
    # Kill any process listening on port 3000
    $proc = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "   Stopped existing process on :3000"
    }
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $webDir -NoNewWindow
    Write-Host "   Dev server starting at http://localhost:3000"
}
