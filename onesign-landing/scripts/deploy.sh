#!/bin/bash

# Deployment script for OneSign Landing Page
# Supports multiple environments: dev, staging, production

set -e

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
REGISTRY=${DOCKER_REGISTRY:-}
IMAGE_NAME="onesign-landing"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}OneSign Landing - Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Version: ${YELLOW}$VERSION${NC}"
echo ""

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo -e "${GREEN}Deploying with Docker Compose...${NC}"

    # Build image
    echo "Building Docker image..."
    docker-compose build landing

    # Start services
    echo "Starting services..."
    docker-compose up -d landing

    # Wait for health check
    echo "Waiting for service to be healthy..."
    sleep 10

    # Check health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Deployment successful!${NC}"
        docker-compose logs --tail=20 landing
    else
        echo -e "${RED}✗ Deployment failed - health check failed${NC}"
        docker-compose logs --tail=50 landing
        exit 1
    fi
}

# Function to deploy to Kubernetes
deploy_kubernetes() {
    echo -e "${GREEN}Deploying to Kubernetes...${NC}"

    # Build and push image
    if [ -n "$REGISTRY" ]; then
        echo "Building and pushing image to registry..."
        docker build -t "$REGISTRY/$IMAGE_NAME:$VERSION" .
        docker push "$REGISTRY/$IMAGE_NAME:$VERSION"
    fi

    # Apply Kubernetes manifests
    echo "Applying Kubernetes manifests..."
    kubectl apply -f k8s/deployment.yaml

    # Wait for rollout
    echo "Waiting for rollout to complete..."
    kubectl rollout status deployment/onesign-landing -n onesign-landing --timeout=300s

    # Check health
    echo "Checking deployment health..."
    kubectl get pods -n onesign-landing

    echo -e "${GREEN}✓ Kubernetes deployment successful!${NC}"
}

# Function to deploy with PM2
deploy_pm2() {
    echo -e "${GREEN}Deploying with PM2...${NC}"

    # Build application
    echo "Building application..."
    npm run build

    # Stop existing process
    echo "Stopping existing process..."
    pm2 stop onesign-landing 2>/dev/null || true

    # Start with PM2
    echo "Starting with PM2..."
    npm run pm2:start

    # Save PM2 configuration
    pm2 save

    # Check status
    sleep 5
    pm2 list | grep onesign-landing

    echo -e "${GREEN}✓ PM2 deployment successful!${NC}"
}

# Main deployment logic
case "$ENVIRONMENT" in
    dev|development)
        deploy_docker_compose
        ;;

    staging|production)
        read -p "Deploy to $ENVIRONMENT? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled."
            exit 0
        fi

        # Choose deployment method
        read -p "Deployment method (docker/k8s/pm2): " method
        case "$method" in
            docker)
                deploy_docker_compose
                ;;
            k8s|kubernetes)
                deploy_kubernetes
                ;;
            pm2)
                deploy_pm2
                ;;
            *)
                echo -e "${RED}Invalid deployment method${NC}"
                exit 1
                ;;
        esac
        ;;

    *)
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        echo "Usage: $0 <environment> [version]"
        echo "Environments: dev, staging, production"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
