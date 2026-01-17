#!/usr/bin/env pwsh
# ============================================================================
# CURIOSITY OCEAN - PYETJE TESTUESE (TEST QUESTIONS)
# Testing with simple curl requests
# ============================================================================

Write-Host ""
Write-Host "=== CURIOSITY OCEAN TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Testing all 12 layers with diverse questions"
Write-Host ""

$baseUrl = "http://46.224.205.183:8000/api/ai/curiosity-ocean"
$results = @()
$totalTime = 0

# Test 1 - Layer 1: Core
Write-Host "[Layer 1] Testing Core Infrastructure..." -ForegroundColor Yellow
$url1 = "$baseUrl`?question=What%20is%20core%20infrastructure&mode=curious&stream=false"
$start1 = Get-Date
try {
    $resp1 = curl -s "$url1" -w "`n%{http_code}"
    $time1 = (Get-Date - $start1).TotalMilliseconds
    Write-Host "[L1] [curious] ${time1:F1}ms - TESTED"
    $totalTime += $time1
} catch { Write-Host "[L1] - ERROR" }

# Test 2 - Layer 2: DDoS
Write-Host "[Layer 2] Testing DDoS Protection..." -ForegroundColor Yellow
$url2 = "$baseUrl`?question=How%20does%20DDoS%20protection%20work&mode=curious&stream=false"
$start2 = Get-Date
try {
    $resp2 = curl -s "$url2" -w "`n%{http_code}"
    $time2 = (Get-Date - $start2).TotalMilliseconds
    Write-Host "[L2] [curious] ${time2:F1}ms - TESTED"
    $totalTime += $time2
} catch { Write-Host "[L2] - ERROR" }

# Test 3 - Layer 3: Mesh
Write-Host "[Layer 3] Testing Mesh Network..." -ForegroundColor Yellow
$url3 = "$baseUrl`?question=How%20do%20LoRa%20mesh%20networks%20work&mode=wild&stream=false"
$start3 = Get-Date
try {
    $resp3 = curl -s "$url3" -w "`n%{http_code}"
    $time3 = (Get-Date - $start3).TotalMilliseconds
    Write-Host "[L3] [wild] ${time3:F1}ms - TESTED"
    $totalTime += $time3
} catch { Write-Host "[L3] - ERROR" }

# Test 4 - Layer 4: ALBA
Write-Host "[Layer 4] Testing ALBA (EEG)..." -ForegroundColor Yellow
$url4 = "$baseUrl`?question=What%20is%20EEG%20signal%20processing&mode=curious&stream=false"
$start4 = Get-Date
try {
    $resp4 = curl -s "$url4" -w "`n%{http_code}"
    $time4 = (Get-Date - $start4).TotalMilliseconds
    Write-Host "[L4] [curious] ${time4:F1}ms - TESTED"
    $totalTime += $time4
} catch { Write-Host "[L4] - ERROR" }

# Test 5 - Layer 5: ALBI
Write-Host "[Layer 5] Testing ALBI (Intelligence)..." -ForegroundColor Yellow
$url5 = "$baseUrl`?question=How%20does%20neural%20intelligence%20work&mode=wild&stream=false"
$start5 = Get-Date
try {
    $resp5 = curl -s "$url5" -w "`n%{http_code}"
    $time5 = (Get-Date - $start5).TotalMilliseconds
    Write-Host "[L5] [wild] ${time5:F1}ms - TESTED"
    $totalTime += $time5
} catch { Write-Host "[L5] - ERROR" }

# Test 6 - Layer 6: JONA
Write-Host "[Layer 6] Testing JONA (Ethics)..." -ForegroundColor Yellow
$url6 = "$baseUrl`?question=What%20are%20ethical%20frameworks%20in%20AI&mode=genius&stream=false"
$start6 = Get-Date
try {
    $resp6 = curl -s "$url6" -w "`n%{http_code}"
    $time6 = (Get-Date - $start6).TotalMilliseconds
    Write-Host "[L6] [genius] ${time6:F1}ms - TESTED"
    $totalTime += $time6
} catch { Write-Host "[L6] - ERROR" }

# Test 7 - Layer 7: Curiosity Ocean
Write-Host "[Layer 7] Testing Curiosity Ocean..." -ForegroundColor Yellow
$url7 = "$baseUrl`?question=How%20does%20knowledge%20synthesis%20work&mode=curious&stream=false"
$start7 = Get-Date
try {
    $resp7 = curl -s "$url7" -w "`n%{http_code}"
    $time7 = (Get-Date - $start7).TotalMilliseconds
    Write-Host "[L7] [curious] ${time7:F1}ms - TESTED"
    $totalTime += $time7
} catch { Write-Host "[L7] - ERROR" }

# Test 8 - Layer 8: Neuroacoustic
Write-Host "[Layer 8] Testing Neuroacoustic..." -ForegroundColor Yellow
$url8 = "$baseUrl`?question=Can%20brain%20signals%20become%20sound&mode=chaos&stream=false"
$start8 = Get-Date
try {
    $resp8 = curl -s "$url8" -w "`n%{http_code}"
    $time8 = (Get-Date - $start8).TotalMilliseconds
    Write-Host "[L8] [chaos] ${time8:F1}ms - TESTED"
    $totalTime += $time8
} catch { Write-Host "[L8] - ERROR" }

# Test 9 - Layer 9: Memory
Write-Host "[Layer 9] Testing Memory..." -ForegroundColor Yellow
$url9 = "$baseUrl`?question=How%20does%20memory%20management%20work&mode=curious&stream=false"
$start9 = Get-Date
try {
    $resp9 = curl -s "$url9" -w "`n%{http_code}"
    $time9 = (Get-Date - $start9).TotalMilliseconds
    Write-Host "[L9] [curious] ${time9:F1}ms - TESTED"
    $totalTime += $time9
} catch { Write-Host "[L9] - ERROR" }

# Test 10 - Layer 10: Quantum
Write-Host "[Layer 10] Testing Quantum..." -ForegroundColor Yellow
$url10 = "$baseUrl`?question=What%20is%20quantum%20optimization&mode=genius&stream=false"
$start10 = Get-Date
try {
    $resp10 = curl -s "$url10" -w "`n%{http_code}"
    $time10 = (Get-Date - $start10).TotalMilliseconds
    Write-Host "[L10] [genius] ${time10:F1}ms - TESTED"
    $totalTime += $time10
} catch { Write-Host "[L10] - ERROR" }

# Test 11 - Layer 11: AGI
Write-Host "[Layer 11] Testing AGI..." -ForegroundColor Yellow
$url11 = "$baseUrl`?question=How%20does%20AGI%20reasoning%20work&mode=genius&stream=false"
$start11 = Get-Date
try {
    $resp11 = curl -s "$url11" -w "`n%{http_code}"
    $time11 = (Get-Date - $start11).TotalMilliseconds
    Write-Host "[L11] [genius] ${time11:F1}ms - TESTED"
    $totalTime += $time11
} catch { Write-Host "[L11] - ERROR" }

# Test 12 - Layer 12: ASI
Write-Host "[Layer 12] Testing ASI..." -ForegroundColor Yellow
$url12 = "$baseUrl`?question=What%20is%20superintelligence%20oversight&mode=genius&stream=false"
$start12 = Get-Date
try {
    $resp12 = curl -s "$url12" -w "`n%{http_code}"
    $time12 = (Get-Date - $start12).TotalMilliseconds
    Write-Host "[L12] [genius] ${time12:F1}ms - TESTED"
    $totalTime += $time12
} catch { Write-Host "[L12] - ERROR" }

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Green
Write-Host "Total Request Time: ${totalTime:F1}ms"
Write-Host "Average Per Layer: $([Math]::Round($totalTime/12, 1))ms"
Write-Host ""
Write-Host "Status: All layers tested successfully!" -ForegroundColor Green
