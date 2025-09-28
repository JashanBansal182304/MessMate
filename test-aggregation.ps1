Write-Host "=== Testing Meal Booking Aggregation ==="
Write-Host ""

# Clear existing data first
Write-Host "Step 1: Clearing existing meal bookings..."
try {
    $clearResult = Invoke-RestMethod -Uri "http://localhost:8080/api/menu/bookings/clear" -Method DELETE
    Write-Host "✅ Cleared: $($clearResult.message)"
} catch {
    Write-Host "Clear endpoint not available or data already empty"
}

Write-Host ""
Write-Host "Step 2: Testing booking aggregation..."

# First booking
Write-Host "Student A books breakfast (quantity: 2)..."
$booking1 = @{
    dailyMenuId = 12
    quantity = 2
    specialInstructions = "Student A - No spicy food"
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "http://localhost:8080/api/menu/book" -Method POST -Body $booking1 -ContentType "application/json"
    Write-Host "   Result: Booking ID $($result1.data.id), Quantity: $($result1.data.quantity)"
    $firstBookingId = $result1.data.id
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)"
    exit
}

# Second booking for same meal
Write-Host "Student B books same breakfast (quantity: 1)..."
$booking2 = @{
    dailyMenuId = 12
    quantity = 1
    specialInstructions = "Student B - Extra portion"
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "http://localhost:8080/api/menu/book" -Method POST -Body $booking2 -ContentType "application/json"
    Write-Host "   Result: Booking ID $($result2.data.id), Quantity: $($result2.data.quantity)"
    Write-Host "   Instructions: $($result2.data.specialInstructions)"
    
    if ($firstBookingId -eq $result2.data.id) {
        Write-Host "   SUCCESS: Bookings were AGGREGATED (same booking ID)"
        Write-Host "   Total quantity should be 3: $($result2.data.quantity)"
    } else {
        Write-Host "   PROBLEM: Created SEPARATE bookings (different IDs)"
        Write-Host "   This means aggregation is NOT working"
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test Complete ==="