# MongoDB Setup Script for FuelFit AI
# Run this script as Administrator

Write-Host "🔧 Setting up MongoDB for FuelFit AI..." -ForegroundColor Cyan

# Check if MongoDB is installed
Write-Host "`n📦 Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongodVersion = mongod --version 2>&1 | Select-String "version"
    Write-Host "✅ MongoDB is installed: $mongodVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

# Check if MongoDB service is running
Write-Host "`n🔍 Checking MongoDB service status..." -ForegroundColor Yellow
$service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($service) {
    if ($service.Status -eq "Running") {
        Write-Host "✅ MongoDB service is already running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB service is stopped. Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MongoDB"
            Write-Host "✅ MongoDB service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start MongoDB service. You may need to run as Administrator" -ForegroundColor Red
            Write-Host "Try running: net start MongoDB" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  MongoDB service not found. MongoDB might be running manually." -ForegroundColor Yellow
}

# Check if MongoDB is listening on port 27017
Write-Host "`n🔍 Checking if MongoDB is listening on port 27017..." -ForegroundColor Yellow
$portCheck = netstat -an | Select-String ":27017"
if ($portCheck) {
    Write-Host "✅ MongoDB is listening on port 27017" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is not listening on port 27017" -ForegroundColor Yellow
    Write-Host "You may need to start MongoDB manually" -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
Write-Host "`n📝 Setting up environment variables..." -ForegroundColor Yellow
$envPath = "server\.env"
if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists at $envPath" -ForegroundColor Yellow
    Write-Host "Please check that it contains:" -ForegroundColor Yellow
    Write-Host "  MONGODB_URI=mongodb://localhost:27017/fuelfit" -ForegroundColor Cyan
} else {
    $envContent = @"
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/fuelfit

# JWT Secret (change this in production!)
JWT_SECRET=fuelfit-secret-key-change-in-production
JWT_EXPIRE=7d

# Server Port
PORT=3030

# Optional: OpenAI API Key
# OPENAI_API_KEY=your_key_here
"@
    try {
        New-Item -Path $envPath -ItemType File -Force | Out-Null
        Set-Content -Path $envPath -Value $envContent
        Write-Host "✅ Created .env file at $envPath" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
        Write-Host "Please create it manually with the following content:" -ForegroundColor Yellow
        Write-Host $envContent -ForegroundColor Cyan
    }
}

# Test MongoDB connection
Write-Host "`n🧪 Testing MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongo --eval "db.version()" --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB connection test successful!" -ForegroundColor Green
        Write-Host "   Version: $mongoTest" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Could not test MongoDB connection directly" -ForegroundColor Yellow
        Write-Host "   This is okay - the app will test the connection when it starts" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not test MongoDB connection (mongo shell not found)" -ForegroundColor Yellow
    Write-Host "   This is okay - the app will test the connection when it starts" -ForegroundColor Yellow
}

Write-Host "`n✨ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "   2. Install dependencies: npm run install-all" -ForegroundColor White
Write-Host "   3. Start the app: npm run dev" -ForegroundColor White
Write-Host "`n💡 If MongoDB service won't start, try running this script as Administrator" -ForegroundColor Yellow

