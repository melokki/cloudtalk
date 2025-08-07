# Product Review System

A microservices-based product review system built with modern Node.js technologies, featuring distributed architecture with real-time review processing and caching capabilities.


## 🛠 Technology Stack

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **TypeScript** - Type-safe JavaScript development
- **Fastify** - High-performance web framework for REST APIs
- **Prisma** - Modern database ORM with type safety

### Databases & Caching
- **PostgreSQL** - Primary relational database for data persistence
- **Redis** - In-memory caching and message broker

### Message Queue & Processing
- **BullMQ** - Robust job queue system for distributed processing
- **Redis** - Message broker backend for BullMQ

### Development & Deployment
- **pnpm** - Fast, disk space efficient package manager with workspace support
- **Docker & Docker Compose** - Containerization and orchestration
- **Pino** - High-performance structured logging

## 📁 Project Structure

This project is organized as a **pnpm monorepo** containing multiple services and shared packages:

```
product-review-system/
├── database/
│   ├── prisma/
│       └── schema.prisma        # Database schema definition
│
├── services/
│   ├── product/             # Main API service
│   │   ├── src/
│   │   └── package.json
│   └── review-processing/   # Background worker service
│       ├── src/
│       └── package.json
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## 🏗 Architecture Overview

### Microservices Design

The system follows a **microservices architecture** with clear separation of concerns:

#### 1. **Product Service** [(`@service/product`) read more](docs/products/README.md)
- **Purpose**: RESTful API for product and review management
- **Technology**: Fastify + Prisma + BullMQ Publisher
- **Responsibilities**:
  - Product CRUD operations
  - Review CRUD operations
  - Event publishing for review changes
  - Response caching with Redis

#### 2. **Review Processing Service** [(`@service/review-processing`) read more](docs/review-processing/README.md)
- **Purpose**: Asynchronous review processing and rating calculations
- **Technology**: Node.js + BullMQ Worker + Prisma
- **Responsibilities**:
  - Consuming review events from queue
  - Calculating average product ratings
  - Updating rating cache
  - Concurrent event processing

#### 3. **Shared Database Schema** [read more](docs/database/README.md)
- **Purpose**: Shared Prisma schema and client
- **Technology**: Prisma ORM
- **Benefits**:
  - Consistent database models across services
  - Type safety for database operations
  - Centralized schema management

### Event-Driven Communication

![Schema](https://excalidraw.com/#json=0CVvqWV78wgmb3gcc2w2N,4Aau3oUdXM-h0IOChZFzAQ)

```mermaid
graph LR
    A[Product Service] -->|Publish Event| B[BullMQ Queue]
    B -->|Consume Event| C[Review Processing Service]
    C -->|Update Rating| D[PostgreSQL]
    C -->|Update Cache| E[Redis Cache]
    A -->|Read Cache| E
```


## 🚀 Key Features

### Core Functionality
- ✅ **Product Management** - Full CRUD operations for products
- ✅ **Review Management** - Create, update, delete product reviews
- ✅ **Average Rating Calculation** - Real-time rating updates via background processing
- ✅ **Pagination Support** - Cursor-based pagination for scalable data retrieval

### Performance & Scalability
- ✅ **Redis Caching** - Cached product ratings and reviews with TTL
- ✅ **Concurrent Processing** - Configurable worker concurrency
- ✅ **Multi-Instance Support** - Horizontal scaling for review processing
- ✅ **Queue-Based Architecture** - Reliable event processing with retry mechanisms

### Developer Experience
- ✅ **Type Safety** - Full TypeScript coverage across all services
- ✅ **Structured Logging** - Pino logger with contextual information
- ✅ **Error Handling** - Comprehensive error handling with proper HTTP status codes
- ✅ **Workspace Management** - pnpm monorepo for efficient dependency management



## 📈 Performance Optimizations

### Caching Strategy
- **Product Ratings**: 5-minute TTL, invalidated on review changes
- **Product Reviews**: Paginated cache with cursor-based keys
- **Cache Warming**: Automatic cache updates from background service

### Scalability Features
- **Horizontal Scaling**: Multiple review processing instances
- **Concurrent Processing**: Configurable worker pool per instance
- **Queue Partitioning**: Event distribution across workers
- **Connection Pooling**: Optimized database connections


## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 24
- pnpm 10
- Docker & Docker Compose
- PostgreSQL 17
- Redis 8



### Installation

```bash
# Clone repository
git clone <repository-url>
cd product-review-system

# Setup environment
cp .env.example .env
```


## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dataabse_name

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# PostgreSQL
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# Services
LOG_LEVEL=info
NODE_ENV=production
```

After all the environmental variables have been set the project can now be started using docker

```bash
docker compose up
```

On the first run, this should trigger the build process of the images as well

## 📋 Design Decisions & Trade-offs

### Database Design
- **Shared Database**: Chosen for simplicity and consistency in demo environment
- **Production Alternative**: Separate databases per service for better isolation

### Caching Strategy
- **TTL-based**: Simple cache invalidation with acceptable eventual consistency
- **Cache-aside Pattern**: Explicit cache management for predictable behavior

### Event Processing
- **BullMQ over Redis Pub/Sub**: Chosen for reliability and job persistence
- **At-least-once Delivery**: Acceptable for rating calculations with idempotent operations

### Technology Choices
- **Fastify over Express**: Better performance and built-in TypeScript support
- **Pino over Winston**: Superior performance for high-throughput logging
- **pnpm over npm/yarn**: Better workspace support and disk efficiency


**Built with ❤️ using modern Node.js microservices architecture**
