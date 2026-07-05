# Arbiter Coffee Hub API Documentation

This document provides an overview of the Arbiter Coffee Hub API endpoints.

## Base URL
All API endpoints are prefixed with `/api/v1/`

```
https://api.arbitercoffee.com/api/v1/
```

## Authentication
The API uses Laravel Sanctum for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Response Format
All API responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

## Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /auth/register | Register a new user |
| POST   | /auth/login | Login and receive API token |
| POST   | /auth/logout | Logout and invalidate token |
| POST   | /auth/refresh | Refresh expired token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /users/me | Get current user profile |
| PUT    | /users/me | Update current user profile |
| GET    | /users/{id} | Get user by ID (admin only) |
| GET    | /users | List users with pagination (admin only) |
| DELETE | /users/{id} | Delete user (admin only) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /products | List all products with filtering and pagination |
| GET    | /products/{id} | Get product by ID |
| POST   | /products | Create a new product |
| PUT    | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |
| GET    | /products/categories | List all product categories |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /orders | List orders with filtering and pagination |
| GET    | /orders/{id} | Get order by ID |
| POST   | /orders | Create a new order |
| PUT    | /orders/{id} | Update order |
| DELETE | /orders/{id} | Cancel order |
| GET    | /orders/{id}/items | Get order items |
| POST   | /orders/{id}/payment | Process payment for order |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /customers | List customers with filtering and pagination |
| GET    | /customers/{id} | Get customer by ID |
| POST   | /customers | Create a new customer |
| PUT    | /customers/{id} | Update customer |
| DELETE | /customers/{id} | Delete customer |
| GET    | /customers/{id}/orders | Get customer's order history |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /inventory | List inventory items with filtering |
| GET    | /inventory/{id} | Get inventory item by ID |
| POST   | /inventory | Add inventory stock |
| PUT    | /inventory/{id} | Update inventory quantity |
| POST   | /inventory/reserve | Reserve inventory for order |
| POST   | /inventory/release | Release reserved inventory |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /analytics/sales | Get sales analytics |
| GET    | /analytics/inventory | Get inventory analytics |
| GET    | /analytics/customers | Get customer analytics |
| GET    | /analytics/employees | Get employee performance analytics |
| GET    | /analytics/dashboard | Get dashboard summary data |

## Rate Limiting
API requests are rate limited to prevent abuse:
- Authenticated users: 100 requests per minute
- Unauthenticated users: 20 requests per minute
- Burst limit: 20 requests

## Error Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity (Validation errors) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Versioning
API versions are indicated in the URL path:
- v1: Current stable version
- Deprecated versions are supported for 6 months after deprecation notice

## Changelog
### v1.0.0 (Initial Release)
- Authentication endpoints
- User management
- Product catalog
- Order processing
- Customer management
- Inventory tracking
- Basic analytics

## Support
For API-related issues, please contact:
- Email: api-support@arbitercoffee.com
- Slack: #api-support
- Documentation: https://docs.arbitercoffee.com/api

---
*Last updated: June 2026*