$loginResponse = Invoke-RestMethod -Uri http://localhost:8081/auth/login -Method Post -Body '{"username":"faculty","password":"Faculty@123","role":null}' -ContentType "application/json"
$token = $loginResponse.accessToken
$headers = @{ Authorization = "Bearer $token" }

function Test-Endpoint {
    param($method, $url, $body)
    
    try {
        if ($body) {
            $response = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -Body $body -ContentType "application/json"
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $method -Headers $headers
        }
        Write-Host "SUCCESS: [$method $url] -> Status: $($response.StatusCode)"
        Write-Host "Response: $($response.Content)"
        Write-Host "---------------------------------------------------"
    } catch {
        Write-Host "ERROR: [$method $url] -> Status: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Error Details: $($_.ErrorDetails.Message)"
        Write-Host "---------------------------------------------------"
    }
}

Test-Endpoint "GET" "http://localhost:8081/api/v1/faculty/me/sections"
Test-Endpoint "GET" "http://localhost:8081/api/v1/faculty/me/timetable"
Test-Endpoint "GET" "http://localhost:8081/api/v1/sections/9999"
Test-Endpoint "GET" "http://localhost:8081/api/v1/sections/9999/students"

$dateStr = Get-Date -Format "yyyy-MM-dd"
Test-Endpoint "GET" "http://localhost:8081/api/v1/attendance/section/9999?date=$dateStr"

$bulkBody = '{"sectionId":9999, "scheduleId":9999, "date":"' + $dateStr + '", "records": [{"studentId":4, "status":"PRESENT", "remarks":"Test"}]}'
Test-Endpoint "POST" "http://localhost:8081/api/v1/attendance/bulk" $bulkBody

# Test missing section
Test-Endpoint "GET" "http://localhost:8081/api/v1/sections/999999"

