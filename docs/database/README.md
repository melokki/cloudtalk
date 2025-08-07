## 📊 Database Schema

### Core Models

The system uses PostgreSQL as the primary database with the following schema design:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Calculated ratings table
CREATE TABLE product_ratings (
  product_id UUID PRIMARY KEY REFERENCES products(id),
  average_rating DECIMAL(3,2) NOT NULL,
  review_count INTEGER NOT NULL,
  creadted_at TIMESTAMP DEFAULT NOW()
);
```

## 🏗 Schema Design Decisions

### Product Model
- **UUID Primary Keys**: Ensures uniqueness across distributed systems
- **Price as Integer**: Stored in cents to avoid floating-point precision issues
- **Timestamps**: Automatic creation and update tracking

### Review Model
- **Separate Name Fields**: Allows for flexible display and searching
- **Product Relationship**: Strong foreign key constraint ensures data integrity

### ProductRating Model
- **Calculated Field**: Stores pre-computed averages for performance
- **Review Count**: Enables statistical analysis and validation
