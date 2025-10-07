# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Node.js microservices e-commerce application demonstrating distributed systems patterns. The architecture consists of three interconnected microservices with service discovery and asynchronous communication.

## Key Commands

### Development Commands
```bash
# Product Service (has development mode)
cd product && npm run dev  # Development mode with hot reload
cd product && npm start    # Production mode
cd product && npm test     # Run Jest tests

# Basket Service (no development mode)
cd basket && npm start

# Inventory Service (no development mode)
cd inventory && npm start

# Run entire application with infrastructure
docker-compose up -d       # Start all services with Consul and RabbitMQ
```

### Service Access Points
- Product Service: http://localhost:3001
- Basket Service: http://localhost:3002
- Inventory Service: http://localhost:3003
- Consul UI: http://localhost:8500

## High-Level Architecture

### Microservices Pattern
The codebase follows a microservices architecture with three main services:

1. **Product Catalog Service** (`product/`) - Manages product data and publishes events
2. **Basket Service** (`basket/`) - Shopping cart functionality with HTTP service calls
3. **Inventory Service** (`inventory/`) - Stock management with event-driven updates

### Communication Patterns
- **Synchronous**: Basket service makes HTTP calls to Product and Inventory services
- **Asynchronous**: Product events published to RabbitMQ, consumed by Inventory and Basket services
- **Service Discovery**: All services register with Consul for dynamic service location

### Key Architectural Components

#### Service Discovery (Consul)
- Services automatically register on startup with health checks
- DNS-based service resolution using `.service.consul` domain
- Health checks run every 10 seconds

#### Message Broker (RabbitMQ)
- Fanout exchange pattern for event broadcasting
- Event types include `Product.Created`
- Enables loose coupling between services

#### Configuration Management
- Environment-based configuration using ENV variables
- Docker Compose defines inter-service communication
- Service-specific configs in each service's repository

### Service Structure Conventions

Each service follows similar patterns:
- Main entry point: `server.js` (or `src/server.js` for product)
- Configuration management approach per service
- Express middleware setup (CORS, Helmet, Morgan)
- Health check endpoints at `/health`
- Service registration with Consul on startup

### Testing Approach
Only the Product service has Jest testing configured. When adding tests to other services, follow the same pattern with `npm test` script.

### Infrastructure-first Design
The application is designed to run primarily through Docker Compose which handles:
- Service networking and DNS resolution
- Container health checks and restarts
- Volume management for persistent data
- Port exposure and service discovery setup