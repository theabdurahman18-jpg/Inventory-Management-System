# Database Schema Specification: Firebase Firestore

The application uses Google Firebase Firestore (Cloud NoSQL document database). The collection architecture and JSON document structures are detailed below.

---

## 📁 Firestore Collections

1. `users`
2. `products`
3. `categories`
4. `sales`

---

## 1. `products` Collection

- **Document ID**: `product_id` (e.g. `PRD-1001`, `PRD-A8F932`)

### Field Specifications:

| Field | Type | Description | Required | Validation / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `product_id` | String | Unique auto-generated product ID | Yes | Prefix `PRD-` followed by uppercase hex |
| `name` | String | Title of the product | Yes | Unique (case-insensitive) |
| `category` | String | Category classification | Yes | References `categories` name |
| `brand` | String | Manufacturer / Brand | No | Default: "Generic" |
| `supplier` | String | Vendor / Supplier name | No | Default: "N/A" |
| `quantity` | Number (Integer) | Current in-stock quantity | Yes | Must be >= 0. Low-stock trigger if < 5 |
| `price` | Number (Float) | Unit selling price ($ USD) | Yes | Must be >= 0.00 |
| `description` | String | Long text description / specs | No | Free form text |
| `image_url` | String | Public HTTP image link or Base64 data URL | No | Image preview thumbnail |
| `created_at` | String (ISO Date) | Timestamp of creation | Yes | e.g. `2026-07-25T12:00:00.000Z` |
| `updated_at` | String (ISO Date) | Timestamp of last modification | Yes | Updated on `PUT` requests |

### Sample JSON Document:
```json
{
  "product_id": "PRD-1001",
  "name": "Dell XPS 15 Laptop",
  "category": "Electronics",
  "brand": "Dell",
  "supplier": "TechData Distribution",
  "quantity": 12,
  "price": 1499.99,
  "description": "High performance laptop with 15.6 inch OLED 4K screen, Intel i7, 16GB RAM.",
  "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
  "created_at": "2026-07-25T13:00:00.000Z",
  "updated_at": "2026-07-25T13:00:00.000Z"
}
```

---

## 2. `categories` Collection

- **Document ID**: `id` (e.g. `cat_1`, `CAT-E9A2B4`)

### Field Specifications:

| Field | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique Category ID | Yes |
| `name` | String | Unique category title | Yes |
| `description` | String | Category summary | No |
| `created_at` | String (ISO Date) | Timestamp of creation | Yes |

### Sample JSON Document:
```json
{
  "id": "cat_1",
  "name": "Electronics",
  "description": "Laptops, smartphones, audio devices, and computer hardware accessories",
  "created_at": "2026-07-25T13:00:00.000Z"
}
```

---

## 3. `users` Collection

- **Document ID**: `uid` (Firebase Authentication User ID)

### Field Specifications:

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Firebase Auth UID |
| `email` | String | User email address |
| `displayName` | String | User full name |
| `role` | String | Access role (`admin`, `manager`, `clerk`) |
| `created_at` | String (ISO Date) | Account creation timestamp |

---

## 4. `sales` Collection

- **Document ID**: `sale_id` (e.g. `SALE-8821`)

### Field Specifications:

| Field | Type | Description |
| :--- | :--- | :--- |
| `sale_id` | String | Transaction identifier |
| `product_id` | String | Reference product ID |
| `quantity_sold` | Number | Quantity sold |
| `total_price` | Number | Total transaction cost ($) |
| `timestamp` | String (ISO Date) | Timestamp of sale |
