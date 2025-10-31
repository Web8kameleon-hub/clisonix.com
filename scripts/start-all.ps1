<#
Start-All.ps1
PowerShell helper to start the local dev stack in separate windows or background jobs.

Usage:
  # Start services as background jobs (default)
  .\scripts\start-all.ps1

  # Start services in new visible PowerShell windows (detached)
  .\scripts\start-all.ps1 -Detached

Edit the $Services list below to add or remove services. Each service has:
  Name, Cwd, Command, Optional Port

This script assumes a Windows environment and a virtualenv at .venv in the repo root.
#>

param(
    [switch]$Detached
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Set-Location -Path $Root

# where venv activate usually lives
$VenvActivate = Join-Path $Root ".venv\Scripts\Activate.ps1"

function Invoke-VenvCommand($cmd) {
    if (Test-Path $VenvActivate) {
        return "& `"$VenvActivate`"; $cmd"
    }
    return $cmd
}

# Default services - edit/extend as needed
$Services = @(
    @{ Name = 'API'; Cwd = $Root; Cmd = Invoke-VenvCommand('uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000'); Port = 8000 },
    @{ Name = 'MESH'; Cwd = $Root; Cmd = Invoke-VenvCommand('uvicorn backend.mesh.server:app --reload --host 0.0.0.0 --port 7777'); Port = 7777 },
    @{ Name = 'ORCH'; Cwd = $Root; Cmd = Invoke-VenvCommand('uvicorn backend.system.smart_orchestrator:app --reload --host 0.0.0.0 --port 5555'); Port = 5555 },
    @{ Name = 'NEXT'; Cwd = Join-Path $Root 'apps\web'; Cmd = "`$env:NEXT_PUBLIC_API_BASE='http://localhost:8000'; npm run dev"; Port = 3000 }
)

Write-Host "Starting services (Detached=$Detached) from root: $Root`n"

foreach ($svc in $Services) {
    $name = $svc.Name
    $cwd  = $svc.Cwd
    $cmd  = $svc.Cmd

    if (-not (Test-Path $cwd)) {
        Write-Warning "Skipping $name - path not found: $cwd"
        continue
    }

    Write-Host "-> $name (port=$($svc.Port), cwd=$cwd)" -ForegroundColor Cyan

    if ($Detached) {
        # open a new PowerShell window for each service so logs are visible
        $psCmd = "Set-Location -Path '$cwd'; $cmd"
        Start-Process -FilePath pwsh -ArgumentList ('-NoExit','-Command', $psCmd) -WorkingDirectory $cwd
    }
    else {
        # start as background job and log to files
        $logDir = Join-Path $Root 'logs'
        if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
        $logFile = Join-Path $logDir ("$($name.ToLower())-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))

        $script = {
            param($cwd, $cmd, $logFile)
            Set-Location -Path $cwd
            # Use cmd.exe wrapper to ensure environment variable syntax works for npm
            $full = $cmd + " 2>&1 | Out-File -FilePath `"$logFile`" -Encoding utf8 -Append"
            Invoke-Expression $full
        }

        Start-Job -ScriptBlock $script -ArgumentList $cwd, $cmd, $logFile | Out-Null
        Write-Host "   started as job; logging -> $logFile`n"
    }
}

if (-not $Detached) {
    Write-Host "All services started as background jobs. Use Get-Job to list, Receive-Job -Id <id> to stream logs, or check logs/" -ForegroundColor Green
} else {
    Write-Host "All services launched in new windows." -ForegroundColor Green
}

Write-Host "Done.`n"
