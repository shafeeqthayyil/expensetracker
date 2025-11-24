# Test API Endpoints

## Test using PowerShell

### 1. Health Check
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health -Method GET
```

### 2. Create Client
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    phone = "1234567890"
    address = "123 Main St"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/clients -Method POST -Body $body -ContentType "application/json"
```

### 3. Get All Clients
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/clients -Method GET
```

### 4. Create Expense Type
```powershell
$body = @{
    name = "Travel"
    description = "Travel expenses"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/expense-types -Method POST -Body $body -ContentType "application/json"
```

### 5. Create Daily Expense
```powershell
$body = @{
    expense_type_id = 1
    client_id = 1
    amount = 5000
    expense_date = "2025-11-24"
    description = "Flight tickets"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/daily-expenses -Method POST -Body $body -ContentType "application/json"
```

### 6. Create Income
```powershell
$body = @{
    client_id = 1
    amount = 25000
    income_date = "2025-11-24"
    description = "Project payment"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/income -Method POST -Body $body -ContentType "application/json"
```

### 7. Get Dashboard
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/dashboard -Method GET
```

### 8. Get Daily Expenses with Pagination
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/daily-expenses?page=1&limit=10" -Method GET
```

## Test using cURL (if installed)

```bash
# Health Check
curl http://localhost:3000/health

# Create Client
curl -X POST http://localhost:3000/api/clients -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}"

# Get Dashboard
curl http://localhost:3000/api/dashboard
```

## Test in Browser

Simply open these URLs in your browser:
- http://localhost:3000/
- http://localhost:3000/health
- http://localhost:3000/api/clients
- http://localhost:3000/api/expense-types
- http://localhost:3000/api/dashboard
