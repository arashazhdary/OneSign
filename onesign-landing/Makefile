.PHONY: help install dev build start clean docker-build docker-run docker-stop health lint

# Default target
help:
	@echo "OneSign Landing Page - Available Commands:"
	@echo ""
	@echo "  make install       - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make start        - Start production server"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make lint         - Run linter"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make docker-stop  - Stop Docker container"
	@echo "  make docker-dev   - Run in Docker dev mode"
	@echo "  make health       - Check health endpoint"
	@echo ""

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

start:
	npm start

clean:
	rm -rf .next node_modules package-lock.json

lint:
	npm run lint

lint-fix:
	npm run lint:fix

docker-build:
	docker build -t onesign-landing:latest .

docker-run:
	docker run -d -p 3001:3001 --name onesign-landing onesign-landing:latest

docker-stop:
	docker stop onesign-landing || true
	docker rm onesign-landing || true

docker-dev:
	docker-compose up landing-dev

docker-prod:
	docker-compose up -d landing

health:
	@curl -s http://localhost:3001/api/health | jq

logs:
	docker logs -f onesign-landing

test-build: build
	@echo "Testing build output..."
	@npm start &
	@sleep 5
	@curl -f http://localhost:3001/api/health || exit 1
	@pkill -f "next start" || true
	@echo "Build test successful!"
