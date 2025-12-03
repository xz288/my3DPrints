# Blake&Casper's 3D Hut

A 3D printing e-commerce store with admin dashboard and SQLite database backend.

## Requirements

- Python 3.11+ (installed)

## Setup & Running

1. **Start the Server**:
   ```bash
   python server.py
   ```

2. **Access the Application**:
   - Open your browser to: `http://localhost:8000`
   - Shop: `http://localhost:8000/shop.html`
   - Admin: `http://localhost:8000/admin.html`

## Admin Credentials

- **Username**: `ZachZhang`
- **Password**: `123abcABC`

## Features

- **Shop**: Browse and view 3D printed products
- **Cart**: Add items to cart (stored in localStorage)
- **Checkout**: Mock payment with shipping address validation
- **Admin Dashboard**:
  - View and manage orders (filter, sort, mark as shipped)
  - Manage products (add, edit, soft delete, restore)
  - Filter products by status, category, and price
  - Upload product images (Base64, max 500KB)

## Database

- SQLite database (`database.db`) stores:
  - Products (with soft delete support)
  - Orders with customer information

## Notes

- First run creates `database.db` with default products
- Products persist across server restarts
- Cart data still uses browser localStorage
- Image uploads are stored as Base64 in the database
