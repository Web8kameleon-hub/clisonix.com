#!/usr/bin/env pwsh
# ============================================================================
# CURIOSITY OCEAN - PYETJE TESTUESE (TEST QUESTIONS)
# Testing with diverse questions across all 12 layers
# ============================================================================

Add-Type -AssemblyName System.Web

$baseUrl = "http://46.224.205.183:8000"
$endpoint = "/api/ai/curiosity-ocean"

# Test questions targeting different layers
$testQuestions = @(
    @{ layer = 1; mode = "curious"; q = "What is the core infrastructure of Clisonix?" },
    @{ layer = 2; mode = "curious"; q = "How does DDoS protection work?" },
    @{ layer = 3; mode = "wild"; q = "How do LoRa mesh networks operate?" },
    @{ layer = 4; mode = "curious"; q = "What is EEG signal processing?" },
    @{ layer = 5; mode = "wild"; q = "How does neural intelligence processing work?" },
    @{ layer = 6; mode = "genius"; q = "What are ethical frameworks in AI?" },
    @{ layer = 7; mode = "curious"; q = "How does knowledge synthesis work across domains?" },
    @{ layer = 8; mode = "chaos"; q = "Can brain signals be converted to sound?" },
    @{ layer = 9; mode = "curious"; q = "How does distributed memory management work?" },
    @{ layer = 10; mode = "genius"; q = "What is quantum optimization?" },
    @{ layer = 11; mode = "genius"; q = "How does AGI reasoning work?" },
    @{ layer = 12; mode = "genius"; q = "What is superintelligence oversight?" }
)

$results = @()
$totalTime = 0

Write-Host ""
Write-Host "=== CURIOSITY OCEAN TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Testing all 12 layers with diverse questions"
Write-Host ""

foreach ($test in $testQuestions) {
    $q = $test.q
    $mode = $test.mode
    $layer = $test.layer
    
    try {
        $encodedQ = [System.Web.HttpUtility]::UrlEncode($q)
        $url = "$baseUrl$endpoint`?question=$encodedQ&mode=$mode&stream=false"
        
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $url -Method POST -TimeoutSec 15 -SkipHttpErrorCheck
        $endTime = Get-Date
        $elapsedMs = ($endTime - $startTime).TotalMilliseconds
        $totalTime += $elapsedMs
        
        if ($response.StatusCode -eq 200) {
            $json = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($json) {
                Write-Host "[L$layer] [$mode] ${elapsedMs:F1}ms - SUCCESS" -ForegroundColor Green
                $results += @{
                    layer = $layer
                    mode = $mode
                    time = $elapsedMs
                    status = "OK"
                }
            } else {
                Write-Host "[L$layer] [$mode] - JSON PARSE ERROR" -ForegroundColor Yellow
                $results += @{ layer = $layer; mode = $mode; time = 0; status = "PARSE_ERROR" }
            }
        } else {
            Write-Host "[L$layer] [$mode] - HTTP ERROR $($response.StatusCode)" -ForegroundColor Red
            $results += @{ layer = $layer; mode = $mode; time = 0; status = "HTTP_ERROR" }
        }
    } catch {
        Write-Host "[L$layer] [$mode] - EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ layer = $layer; mode = $mode; time = 0; status = "EXCEPTION" }
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "=== RESULTS ===" -ForegroundColor Yellow
Write-Host ""

$successCount = ($results | Where-Object { $_.status -eq "OK" }).Count
$avgTime = if ($successCount -gt 0) { ($results | Where-Object { $_.status -eq "OK" } | Measure-Object -Property time -Average).Average } else { 0 }

Write-Host "Total Tests: $($results.Count)"
Write-Host "Successful: $successCount"
Write-Host "Failed: $($results.Count - $successCount)"
Write-Host "Average Response Time: ${avgTime:F2}ms"
Write-Host "Total Time: ${totalTime:F1}ms"
Write-Host ""

Write-Host "=== LAYER CONNECTIVITY ===" -ForegroundColor Green
foreach ($r in $results) {
    $status = if ($r.status -eq "OK") { "CONNECTED" } else { "ERROR: $($r.status)" }
    Write-Host "Layer $($r.layer): $status" -ForegroundColor $(if ($r.status -eq "OK") { "Green" } else { "Red" })
}
Write-Host ""

if ($successCount -eq $results.Count) {
    Write-Host "ALL 12 LAYERS RESPONDING SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "Some layers not responding. Check server connection." -ForegroundColor Yellow
}
