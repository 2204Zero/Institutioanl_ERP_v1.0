$loginResponse = Invoke-RestMethod -Uri http://localhost:8081/auth/login -Method Post -Body '{"username":"finance","password":"Finance@123","role":null}' -ContentType "application/json"
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

Test-Endpoint "GET" "http://localhost:8081/api/v1/finance/reports/summary"
Test-Endpoint "GET" "http://localhost:8081/api/v1/finance/fee-structures"
Test-Endpoint "GET" "http://localhost:8081/api/v1/finance/student-fees"
