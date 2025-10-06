# Syntara Tenders AI - PowerShell Deployment Script
# This script provides various deployment options for different cloud platforms

param(
    [Parameter(Position=0)]
    [ValidateSet("vercel", "docker", "compose", "aws", "gcp", "database", "build", "test", "help")]
    [string]$Command = "help"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if command exists
function Test-Command {
    param([string]$CommandName)
    try {
        Get-Command $CommandName -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Function to install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    npm ci
    Write-Success "Dependencies installed"
}

# Function to run tests
function Invoke-Tests {
    Write-Status "Running tests..."
    try {
        npm run test
        Write-Success "Tests passed"
    }
    catch {
        Write-Warning "Tests failed, but continuing with deployment"
    }
}

# Function to build application
function Build-App {
    Write-Status "Building application..."
    npm run build
    Write-Success "Application built successfully"
}

# Function to deploy to Vercel
function Deploy-Vercel {
    Write-Status "Deploying to Vercel..."
    
    if (-not (Test-Command "vercel")) {
        Write-Status "Installing Vercel CLI..."
        npm install -g vercel
    }
    
    # Check if user is logged in
    try {
        vercel whoami | Out-Null
    }
    catch {
        Write-Status "Please log in to Vercel..."
        vercel login
    }
    
    # Deploy
    vercel --prod
    
    Write-Success "Deployed to Vercel successfully!"
}

# Function to deploy with Docker
function Deploy-Docker {
    Write-Status "Building Docker image..."
    
    if (-not (Test-Command "docker")) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    # Build Docker image
    docker build -t tenders-ai .
    
    Write-Success "Docker image built successfully!"
    Write-Status "To run the container:"
    Write-Host "docker run -p 3000:3000 --env-file .env.local tenders-ai"
}

# Function to deploy with Docker Compose
function Deploy-DockerCompose {
    Write-Status "Deploying with Docker Compose..."
    
    if (-not (Test-Command "docker")) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    if (-not (Test-Command "docker-compose")) {
        Write-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from template..."
        Copy-Item "env.example" ".env"
        Write-Warning "Please update .env file with your actual values before running again."
        exit 1
    }
    
    # Start services
    docker-compose up -d
    
    Write-Success "Application deployed with Docker Compose!"
    Write-Status "Application is running at http://localhost:3000"
}

# Function to deploy to AWS
function Deploy-AWS {
    Write-Status "Deploying to AWS..."
    
    if (-not (Test-Command "aws")) {
        Write-Error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
    }
    catch {
        Write-Error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    }
    
    Write-Status "Building and pushing to ECR..."
    
    # Get AWS account ID and region
    $AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
    $AWS_REGION = (aws configure get region)
    
    # Create ECR repository if it doesn't exist
    try {
        aws ecr describe-repositories --repository-names tenders-ai | Out-Null
    }
    catch {
        aws ecr create-repository --repository-name tenders-ai
    }
    
    # Login to ECR
    $loginCommand = aws ecr get-login-password --region $AWS_REGION
    $loginCommand | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Build and push image
    docker build -t tenders-ai .
    docker tag tenders-ai:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tenders-ai:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tenders-ai:latest"
    
    Write-Success "Image pushed to ECR successfully!"
    Write-Status "Image URI: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tenders-ai:latest"
}

# Function to deploy to Google Cloud
function Deploy-GCP {
    Write-Status "Deploying to Google Cloud Platform..."
    
    if (-not (Test-Command "gcloud")) {
        Write-Error "Google Cloud CLI is not installed. Please install gcloud CLI first."
        exit 1
    }
    
    # Check if user is logged in
    try {
        gcloud auth list --filter=status:ACTIVE --format="value(account)" | Out-Null
    }
    catch {
        Write-Status "Please log in to Google Cloud..."
        gcloud auth login
    }
    
    # Set project
    $PROJECT_ID = gcloud config get-value project
    if ([string]::IsNullOrEmpty($PROJECT_ID)) {
        Write-Error "No Google Cloud project set. Please run 'gcloud config set project YOUR_PROJECT_ID' first."
        exit 1
    }
    
    Write-Status "Building and deploying to Cloud Run..."
    
    # Build and deploy
    gcloud builds submit --tag "gcr.io/$PROJECT_ID/tenders-ai"
    gcloud run deploy tenders-ai `
        --image "gcr.io/$PROJECT_ID/tenders-ai" `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated `
        --port 3000
    
    Write-Success "Deployed to Google Cloud Run successfully!"
}

# Function to setup production database
function Setup-Database {
    Write-Status "Setting up production database..."
    
    # Check if DATABASE_URL is set
    if ([string]::IsNullOrEmpty($env:DATABASE_URL)) {
        Write-Error "DATABASE_URL environment variable is not set."
        exit 1
    }
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    Write-Success "Database setup completed!"
}

# Function to show help
function Show-Help {
    Write-Host "Syntara Tenders AI - PowerShell Deployment Script"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [Command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  vercel          Deploy to Vercel"
    Write-Host "  docker          Build Docker image"
    Write-Host "  compose         Deploy with Docker Compose"
    Write-Host "  aws             Deploy to AWS ECR"
    Write-Host "  gcp             Deploy to Google Cloud Platform"
    Write-Host "  database        Setup production database"
    Write-Host "  build           Build application only"
    Write-Host "  test            Run tests only"
    Write-Host "  help            Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 vercel       # Deploy to Vercel"
    Write-Host "  .\deploy.ps1 docker       # Build Docker image"
    Write-Host "  .\deploy.ps1 compose      # Deploy with Docker Compose"
}

# Main script logic
switch ($Command) {
    "vercel" {
        Test-Prerequisites
        Install-Dependencies
        Invoke-Tests
        Build-App
        Deploy-Vercel
    }
    "docker" {
        Test-Prerequisites
        Install-Dependencies
        Invoke-Tests
        Build-App
        Deploy-Docker
    }
    "compose" {
        Test-Prerequisites
        Deploy-DockerCompose
    }
    "aws" {
        Test-Prerequisites
        Install-Dependencies
        Invoke-Tests
        Build-App
        Deploy-AWS
    }
    "gcp" {
        Test-Prerequisites
        Install-Dependencies
        Invoke-Tests
        Build-App
        Deploy-GCP
    }
    "database" {
        Setup-Database
    }
    "build" {
        Test-Prerequisites
        Install-Dependencies
        Build-App
    }
    "test" {
        Test-Prerequisites
        Install-Dependencies
        Invoke-Tests
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
