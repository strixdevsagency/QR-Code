Set-Location 'd:\projects\strix-qr'
Write-Host "=== Strix QR End-to-End Automated Test ===" -ForegroundColor Cyan

# Remove lock if exists
Remove-Item 'd:\projects\strix-qr\.next\dev\lock' -Force -ErrorAction SilentlyContinue

$nodePath = (Get-Command node).Source
$nextBin = "node_modules/next/dist/bin/next"

Write-Host "Starting Next.js on port 3005 (127.0.0.1)..." -ForegroundColor Yellow
$proc = Start-Process -FilePath $nodePath -ArgumentList "$nextBin dev -p 3005 -H 127.0.0.1" -PassThru -NoNewWindow

$allPassed = $true

try {
    # 1. Wait for server readiness using lightweight API endpoint
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $check = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/config' -TimeoutSec 5 -ErrorAction Stop
            if ($check.success -eq $true) {
                $ready = $true
                Write-Host "`nServer is responsive and ready!" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "." -NoNewline
        }
    }

    if (-not $ready) {
        Write-Host "`nFAIL: Server did not respond within 30s" -ForegroundColor Red
        exit 1
    }

    # Test 1: GET /api/config
    Write-Host "[1/8] Testing Config API (GET /api/config)..." -NoNewline
    $cfg = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/config' -Method Get -TimeoutSec 10
    if ($cfg.success -eq $true -and $cfg.config.adSlots.Count -gt 0) {
        Write-Host " PASS (AdSlots: $($cfg.config.adSlots.Count))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 2: GET /api/sponsors
    Write-Host "[2/8] Testing Sponsors API (GET /api/sponsors)..." -NoNewline
    $sponsors = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/sponsors' -Method Get -TimeoutSec 10
    if ($sponsors.success -eq $true) {
        Write-Host " PASS (Leads: $($sponsors.leads.Count))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 3: POST /api/qr (Creation of Dynamic QR)
    Write-Host "[3/8] Testing QR Creation (POST /api/qr)..." -NoNewline
    $qrPayload = @{
        id = "e2e_qr_test_01"
        userId = "usr_tester_99"
        title = "Production Test Menu"
        qrType = "url"
        isDynamic = $true
        dynamicConfig = @{
            mode = "lifetime"
            currentScans = 0
            destinationType = "url"
            destinationPayload = "https://strixdevs.com"
        }
    } | ConvertTo-Json -Depth 5

    $created = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/qr' -Method Post -Body $qrPayload -ContentType 'application/json' -TimeoutSec 10
    if ($created.success -eq $true -and $created.qr.id -eq "e2e_qr_test_01") {
        Write-Host " PASS (Created: $($created.qr.id), payload: $($created.qr.payload))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 4: GET /api/resolve/e2e_qr_test_01
    Write-Host "[4/8] Testing Dynamic QR Resolver (GET /api/resolve/e2e_qr_test_01)..." -NoNewline
    $resolved = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/resolve/e2e_qr_test_01' -Method Get -TimeoutSec 10
    if ($resolved.status -eq "success" -and $resolved.destination -eq "https://strixdevs.com") {
        Write-Host " PASS (Destination: $($resolved.destination))" -ForegroundColor Green
    } else {
        Write-Host " FAIL (Status: $($resolved.status))" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 5: POST /api/checkout (Simulation Mode)
    Write-Host "[5/8] Testing Checkout API (POST /api/checkout)..." -NoNewline
    $checkoutPayload = @{
        planId = "pro"
        interval = "annual"
        userEmail = "founder@strixdevs.com"
    } | ConvertTo-Json

    $checkout = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/checkout' -Method Post -Body $checkoutPayload -ContentType 'application/json' -TimeoutSec 10
    if ($checkout.provider -eq "simulated" -or $checkout.checkoutUrl) {
        Write-Host " PASS (Provider: $($checkout.provider))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 6: POST /api/email (Simulation Mode)
    Write-Host "[6/8] Testing Email Service (POST /api/email)..." -NoNewline
    $emailPayload = @{
        type = "welcome"
        to = "subscriber@example.com"
        name = "Alex Vance"
    } | ConvertTo-Json

    $email = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/email' -Method Post -Body $emailPayload -ContentType 'application/json' -TimeoutSec 10
    if ($email.success -eq $true) {
        Write-Host " PASS (Simulated: $($email.simulated), ID: $($email.messageId))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 7: GET / (Homepage with initial compilation)
    Write-Host "[7/8] Testing Homepage (GET / with first-load compilation)..." -NoNewline
    $homePage = Invoke-WebRequest -Uri 'http://127.0.0.1:3005/' -UseBasicParsing -TimeoutSec 45
    if ($homePage.StatusCode -eq 200 -and $homePage.Content.Length -gt 1000) {
        Write-Host " PASS (Status 200, $($homePage.Content.Length) bytes)" -ForegroundColor Green
    } else {
        Write-Host " FAIL (Status $($homePage.StatusCode))" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 8: GET /r/e2e_qr_test_01 (Resolver UI Page compilation)
    Write-Host "[8/10] Testing Dynamic QR Page (GET /r/e2e_qr_test_01)..." -NoNewline
    $rPage = Invoke-WebRequest -Uri 'http://127.0.0.1:3005/r/e2e_qr_test_01' -UseBasicParsing -TimeoutSec 45
    if ($rPage.StatusCode -eq 200) {
        Write-Host " PASS (Status 200)" -ForegroundColor Green
    } else {
        Write-Host " FAIL (Status $($rPage.StatusCode))" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 9: POST /api/auth/verify-role (Server Role Verification)
    Write-Host "[9/10] Testing Auth Verify-Role API (POST /api/auth/verify-role)..." -NoNewline
    $verifyPayload = @{
        email = "strixdevs1.0@gmail.com"
        id = "bd9ad143-98ab-4fe0-9151-409154fe1e95"
    } | ConvertTo-Json

    $verifiedUser = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/auth/verify-role' -Method Post -Body $verifyPayload -ContentType 'application/json' -TimeoutSec 10
    if ($verifiedUser.user -and $verifiedUser.user.email -eq "strixdevs1.0@gmail.com") {
        Write-Host " PASS (Role: $($verifiedUser.user.role), Tier: $($verifiedUser.user.tier))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    # Test 10: POST /api/webhooks/payment (Payment Webhook Route)
    Write-Host "[10/10] Testing Payment Webhook (POST /api/webhooks/payment)..." -NoNewline
    $webhookPayload = @{
        type = "checkout.session.completed"
        email = "test.subscriber@strixdevs.com"
        tier = "pro"
    } | ConvertTo-Json

    $webhookRes = Invoke-RestMethod -Uri 'http://127.0.0.1:3005/api/webhooks/payment' -Method Post -Body $webhookPayload -ContentType 'application/json' -TimeoutSec 10
    if ($webhookRes.received -eq $true) {
        Write-Host " PASS (Received: $($webhookRes.received))" -ForegroundColor Green
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $allPassed = $false
    }

    Write-Host ""
    if ($allPassed) {
        Write-Host "=== ALL 10 END-TO-END TESTS PASSED SUCCESSFULLY! ===" -ForegroundColor Green
    } else {
        Write-Host "=== SOME TESTS FAILED ===" -ForegroundColor Red
    }

} finally {
    Write-Host "Stopping dev server process..." -ForegroundColor Yellow
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Remove-Item 'd:\projects\strix-qr\.next\dev\lock' -Force -ErrorAction SilentlyContinue
    Write-Host "Dev server stopped."
}
