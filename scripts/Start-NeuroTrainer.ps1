param(
    [ValidateSet("cycle", "auto")]
    [string]$Trainer = "auto",

    [int]$IntervalSeconds = 45,

    [string]$Mode,

    [switch]$Once
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot

Push-Location $repoRoot
try {
    $projectFile = Join-Path $repoRoot "backend\tsconfig.json"

    switch ($Trainer) {
        "cycle" { $target = "app\modules\balpha_theta_beta.ts" }
        "auto"  { $target = "app\modules\auto_adapt_trainer.ts" }
        default  { throw "Unsupported trainer '$Trainer'" }
    }

    $arguments = @("ts-node", "--project", $projectFile, $target, "--interval", $IntervalSeconds.ToString())

    if ($Trainer -eq "cycle" -and $Mode) {
        $arguments += "--mode=$Mode"
    }

    if ($Once) {
        if ($Trainer -eq "auto") {
            $arguments += "--loop=false"
        }
    }
    else {
        $arguments += "--loop"
    }

    Write-Host "[Start-NeuroTrainer] Running: npx $($arguments -join ' ')" -ForegroundColor Cyan
    & npx @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Trainer exited with code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}
