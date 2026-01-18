Write-Host "Starting Ocean-Core (port 8030)..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
cd c:\Users\Admin\Desktop\Clisonix-cloud\ocean-core
$env:PYTHONPATH = "c:\Users\Admin\Desktop\Clisonix-cloud"
python ocean_api.py
