# REST API Documentation

The Inventory Management System Flask backend exposes RESTful API endpoints for product management, category classification, user authentication, and report summaries.

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/verify-token`
Verifies client-side Firebase ID token.

**Request Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Token verified",
  "user": {
    "uid": "usr_99812",
    "email": "admin@inventory.com"
  }
}
```

---

## 2. Product Endpoints

### `GET /api/products`
Retrieves products with optional search, category filtering, and sorting.

**Query Parameters**:
- `search` (optional): Filter string for name, brand, supplier, or product_id.
- `category` (optional): Category filter (e.g. `Electronics` or `all`).
- `sort_by` (optional): Field to sort by (`name`, `price`, `quantity`, `created_at`). Default: `created_at`.
- `order` (optional): Sort direction (`asc` or `desc`). Default: `desc`.

**Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "product_id": "PRD-1001",
      "name": "Dell XPS 15 Laptop",
      "category": "Electronics",
      "brand": "Dell",
      "supplier": "TechData",
      "quantity": 12,
      "price": 1499.99,
      "description": "High performance 4K OLED laptop",
      "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
      "created_at": "2026-07-25T12:00:00.000Z",
      "updated_at": "2026-07-25T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/products/<product_id>`
Retrieves single product details by ID.

**Response (200 OK)**:
```json
{
  "success": true,
  "product": {
    "product_id": "PRD-1001",
    "name": "Dell XPS 15 Laptop",
    "category": "Electronics",
    "price": 1499.99,
    "quantity": 12
  }
}
```

---

### `POST /api/products`
Creates a new product document.

**Request Body**:
```json
{
  "name": "Logitech MX Master 3S Mouse",
  "category": "Peripherals",
  "brand": "Logitech",
  "supplier": "Logi Direct",
  "quantity": 3,
  "price": 99.99,
  "description": "Ergonomic wireless mouse",
  "image_url": "https://images.unsplash.com/photo-1615663245857"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "product_id": "PRD-4921A3",
    "name": "Logitech MX Master 3S Mouse",
    "category": "Peripherals",
    "quantity": 3,
    "price": 99.99
  }
}
```

**Error Response (409 Conflict - Duplicate)**:
```json
{
  "success": false,
  "error": "Product with name 'Logitech MX Master 3S Mouse' already exists!"
}
```

---

### `PUT /api/products/<product_id>`
Updates an existing product by ID.

**Request Body**:
```json
{
  "price": 89.99,
  "quantity": 15
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "product_id": "PRD-1002",
    "name": "Logitech MX Master 3S Mouse",
    "price": 89.99,
    "quantity": 15
  }
}
```

---

### `DELETE /api/products/<product_id>`
Deletes a product by ID.

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product PRD-1002 deleted successfully"
}
```

---

## 3. Category Endpoints

### `GET /api/categories`
Retrieves all categories.

### `POST /api/categories`
Creates a new category.

**Request Body**:
```json
{
  "name": "Networking",
  "description": "Routers, switches, and patch cables"
}
```

---

## 4. Reports & Analytics Endpoint

### `GET /api/reports/summary`
Calculates aggregated inventory metrics for the dashboard.

**Response (200 OK)**:
```json
{
  "success": true,
  "summary": {
    "total_products": 5,
    "total_categories": 4,
    "total_stock": 50,
    "inventory_value": 24238.38,
    "low_stock_count": 2
  },
  "category_distribution": {
    "Electronics": 12,
    "Peripherals": 28,
    "Office Supplies": 8,
    "Networking": 2
  }
}
```
