#!/bin/bash

# Syntara Tenders AI - Deployment Scripts
# This script provides various deployment options for different cloud platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    npm run test || print_warning "Tests failed, but continuing with deployment"
}

# Function to build application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Check if user is logged in
    if ! vercel whoami >/dev/null 2>&1; then
        print_status "Please log in to Vercel..."
        vercel login
    fi
    
    # Deploy
    vercel --prod
    
    print_success "Deployed to Vercel successfully!"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Building Docker image..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Build Docker image
    docker build -t tenders-ai .
    
    print_success "Docker image built successfully!"
    print_status "To run the container:"
    echo "docker run -p 3000:3000 --env-file .env.local tenders-ai"
}

# Function to deploy with Docker Compose
deploy_docker_compose() {
    print_status "Deploying with Docker Compose..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.example .env
        print_warning "Please update .env file with your actual values before running again."
        exit 1
    fi
    
    # Start services
    docker-compose up -d
    
    print_success "Application deployed with Docker Compose!"
    print_status "Application is running at http://localhost:3000"
}

# Function to deploy to AWS
deploy_aws() {
    print_status "Deploying to AWS..."
    
    if ! command_exists aws; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_status "Building and pushing to ECR..."
    
    # Get AWS account ID and region
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region)
    
    # Create ECR repository if it doesn't exist
    aws ecr describe-repositories --repository-names tenders-ai >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name tenders-ai
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build and push image
    docker build -t tenders-ai .
    docker tag tenders-ai:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tenders-ai:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tenders-ai:latest
    
    print_success "Image pushed to ECR successfully!"
    print_status "Image URI: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tenders-ai:latest"
}

# Function to deploy to Google Cloud
deploy_gcp() {
    print_status "Deploying to Google Cloud Platform..."
    
    if ! command_exists gcloud; then
        print_error "Google Cloud CLI is not installed. Please install gcloud CLI first."
        exit 1
    fi
    
    # Check if user is logged in
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_status "Please log in to Google Cloud..."
        gcloud auth login
    fi
    
    # Set project
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        print_error "No Google Cloud project set. Please run 'gcloud config set project YOUR_PROJECT_ID' first."
        exit 1
    fi
    
    print_status "Building and deploying to Cloud Run..."
    
    # Build and deploy
    gcloud builds submit --tag gcr.io/$PROJECT_ID/tenders-ai
    gcloud run deploy tenders-ai \
        --image gcr.io/$PROJECT_ID/tenders-ai \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --port 3000
    
    print_success "Deployed to Google Cloud Run successfully!"
}

# Function to setup production database
setup_database() {
    print_status "Setting up production database..."
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is not set."
        exit 1
    fi
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    print_success "Database setup completed!"
}

# Function to show help
show_help() {
    echo "Syntara Tenders AI - Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  vercel          Deploy to Vercel"
    echo "  docker          Build Docker image"
    echo "  compose         Deploy with Docker Compose"
    echo "  aws             Deploy to AWS ECR"
    echo "  gcp             Deploy to Google Cloud Platform"
    echo "  database        Setup production database"
    echo "  build           Build application only"
    echo "  test            Run tests only"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 vercel       # Deploy to Vercel"
    echo "  $0 docker       # Build Docker image"
    echo "  $0 compose      # Deploy with Docker Compose"
}

# Main script logic
main() {
    case "${1:-help}" in
        "vercel")
            check_prerequisites
            install_dependencies
            run_tests
            build_app
            deploy_vercel
            ;;
        "docker")
            check_prerequisites
            install_dependencies
            run_tests
            build_app
            deploy_docker
            ;;
        "compose")
            check_prerequisites
            deploy_docker_compose
            ;;
        "aws")
            check_prerequisites
            install_dependencies
            run_tests
            build_app
            deploy_aws
            ;;
        "gcp")
            check_prerequisites
            install_dependencies
            run_tests
            build_app
            deploy_gcp
            ;;
        "database")
            setup_database
            ;;
        "build")
            check_prerequisites
            install_dependencies
            build_app
            ;;
        "test")
            check_prerequisites
            install_dependencies
            run_tests
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
