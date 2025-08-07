# Product Service Documentation

The Product Service is the main API gateway for the product review system, providing RESTful endpoints for product and review management with integrated caching and event publishing capabilities.

## 📑 Table of Contents

- [Service Overview](#-service-overview)
- [API Documentation](#-api-documentation)
- [Request/Response Examples](#-requestresponse-examples)
- [Query Parameters & Pagination](#-query-parameters--pagination)
- [Event Publishing](#-event-publishing)
- [Error Handling](#-error-handling)

## 🏗 Service Overview

### Technology Stack
- **Framework**: Fastify v5.x
- **ORM**: Prisma
- **Queue**: BullMQ for event publishing
- **Cache**: Redis
- **Validation**: Fastify JSON Schema validation
- **Logging**: Pino structured logging

### Architecture Components
- **Controllers**: Handle HTTP requests and responses
- **DI Container**: Dependency injection with Awilix

## 📝 API Documentation

### Product Endpoints

#### `GET /products`
List products with average ratings and pagination support.

**Query Parameters:**
- `cursor` (optional): Pagination cursor (product ID)
- `limit` (optional): Number of items per page (default: 10, max: 100)

#### `GET /products/:id`
Get detailed product information including cached average rating.

**Path Parameters:**
- `id`: Product UUID

#### `POST /products`
Create a new product.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "price": "integer (required, in cents)"
}
```

#### `PUT /products/:id`
Update an existing product.

**Path Parameters:**
- `id`: Product UUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "price": "integer (optional, in cents)"
}
```

#### `DELETE /products/:id`
Delete a product and all associated reviews.

**Path Parameters:**
- `id`: Product UUID

### Review Endpoints

#### `GET /products/:id/reviews`
List reviews for a specific product with pagination.

**Path Parameters:**
- `id`: Product UUID

**Query Parameters:**
- `cursor` (optional): Pagination cursor (review ID)
- `limit` (optional): Number of items per page (default: 10, max: 50)

#### `POST /products/:id/reviews`
Create a new review for a product.

**Path Parameters:**
- `id`: Product UUID

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "reviewText": "string (required)",
  "rating": "integer (required, 1-5)"
}
```

#### `PUT /reviews/:id`
Update an existing review.

**Path Parameters:**
- `id`: Review UUID

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "reviewText": "string (optional)",
  "rating": "integer (optional, 1-5)"
}
```

#### `DELETE /reviews/:id`
Delete a review.

**Path Parameters:**
- `id`: Review UUID

## 📋 Request/Response Examples

### Create Product

**Request:**
```bash
POST /products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone with titanium design",
  "price": 119999
}
```

**Response:**
```json
{
  "message": "Product successfully created",
}
```

### Get Product with Rating

**Request:**
```bash
GET /products/019878be-b740-7b13-a651-6c83a8658564
```

**Response:**
```json
{
  "data": {
    "id": "019878be-b740-7b13-a651-6c83a8658564",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone with titanium design",
    "price": 119999,
    "averageRating": 4.25,
  }
}
```

### Create Review

**Request:**
```bash
POST /products/019878be-b740-7b13-a651-6c83a8658564/reviews
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "reviewText": "Excellent phone with amazing camera quality!",
  "rating": 5
}
```

**Response:**
```json
{
  "message": "Review successfully created",
}
```

### List Products with Pagination

**Request:**
```bash
GET /products?limit=5&cursor=019878be-b740-7b13-a651-6c83a8658564
```

**Response:**
```json
{
  "data": [
    {
      "id": "019878bf-1234-7b13-a651-6c83a8658565",
      "name": "Samsung Galaxy S24",
      "description": "Android flagship with AI features",
      "price": 99999,
      "averageRating": 4.1,
    }
  ],
  "nextCursor": "019878bf-1234-7b13-a651-6c83a8658565"
}
```

## 🔍 Query Parameters & Pagination

### Pagination Strategy
The service uses **cursor-based pagination** for scalable data retrieval:

- **Cursor**: Uses the `id` field of the last item in the current page
- **Advantages**: Consistent results even when data changes, better performance
- **Default Limit**: 10 items for products, 10 items for reviews


### Query Parameter Validation
```typescript
interface PaginationQuery {
  cursor?: string;  // UUID format validation
  limit?: number;
}
```

### Navigation Example
```bash
# First page
GET /products?limit=10

# Next page (using nextCursor from previous response)
GET /products?limit=10&cursor=019878be-b740-7b13-a651-6c83a8658564

# Empty nextCursor indicates end of data
```

## 🔄 Event Publishing

### Event Types Published

The service publishes events to the `review-processing` BullMQ queue:

```typescript
interface ReviewEvent {
  type: 'review.created' | 'review.updated' | 'review.deleted';
  productId: string;
  reviewId: string;
  rating?: number;
  oldRating?: number;  // Only for updates
  timestamp: string;
}
```

### Event Publishing Triggers

#### Review Created
```json
{
  "type": "review.created",
  "productId": "019878be-b740-7b13-a651-6c83a8658564",
  "reviewId": "019878bf-2d40-7c14-b652-7d94b9759675",
  "rating": 5,
  "timestamp": "2025-01-01T11:15:00.000Z"
}
```

#### Review Updated
```json
{
  "type": "review.updated",
  "productId": "019878be-b740-7b13-a651-6c83a8658564",
  "reviewId": "019878bf-2d40-7c14-b652-7d94b9759675",
  "rating": 4,
  "oldRating": 5,
  "timestamp": "2025-01-01T12:30:00.000Z"
}
```

#### Review Deleted
```json
{
  "type": "review.deleted",
  "productId": "019878be-b740-7b13-a651-6c83a8658564",
  "reviewId": "019878bf-2d40-7c14-b652-7d94b9759675",
  "rating": 4,
  "timestamp": "2025-01-01T13:45:00.000Z"
}
```

### Queue Configuration
- **Queue Name**: `review-processing`
- **Retry Policy**: 3 attempts with exponential backoff


## ❌ Error Handling

### HTTP Status Codes

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request data |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate product name |
| 500 | Internal Server Error | System/database errors |

### Common Error Examples

#### Resource Not Found (404)
```json
{
  "message": "Product not found"
}
```

#### Duplicate Product (409)
```json
{
  "message": "This product already exists in database"
}
```

#### Database Error (500)
```json
{
  "message": "Could not save the review. Please try again later"
}
```

### Prisma Error Handling
- **P2025**: Record not found → 404 Not Found
- **P2002**: Unique constraint violation → 409 Conflict
- **P2003**: Foreign key constraint → 400 Bad Request
