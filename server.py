#!/usr/bin/env python3
import json
import sqlite3
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

DB_FILE = 'database.db'

def init_db():
    """Initialize the SQLite database with tables"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Products table
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        deleted INTEGER DEFAULT 0
    )''')
    
    # Orders table
    c.execute('''CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        customer_json TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total TEXT NOT NULL,
        status TEXT NOT NULL
    )''')
    
    # Check if products table is empty, if so add defaults
    c.execute('SELECT COUNT(*) FROM products')
    count = c.fetchone()[0]
    
    if count == 0:
        # Default products
        default_products = [
            ('1701720000001', 'T-Rex Figurine', '$24.99', 'Toys', 'A detailed 3D printed T-Rex figurine.', '🦖', 0),
            ('1701720000002', 'Custom Phone Stand', '$12.99', 'Accessories', 'Ergonomic phone stand for your desk.', '📱', 0),
            ('1701720000003', 'Gear Keychain', '$8.99', 'Accessories', 'A functional gear keychain.', '⚙️', 0),
            ('1701720000004', 'Mini Planters', '$15.99', 'Home Decor', 'Set of 3 small planters for succulents.', '🌵', 0),
        ]
        
        c.executemany(
            'INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?)',
            default_products
        )
    
    conn.commit()
    conn.close()

class APIHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/products':
            self.get_products()
        elif self.path == '/api/orders':
            self.get_orders()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/products':
            self.save_product()
        elif self.path == '/api/orders':
            self.create_order()
        else:
            self.send_error(404)
    
    def do_PUT(self):
        if self.path.startswith('/api/orders/'):
            self.update_order()
        elif self.path.startswith('/api/products/'):
            self.restore_product()
        else:
            self.send_error(404)
    
    def do_DELETE(self):
        if self.path.startswith('/api/products/'):
            self.delete_product()
        else:
            self.send_error(404)
    
    def get_products(self):
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('SELECT * FROM products')
        rows = c.fetchall()
        conn.close()
        
        products = {}
        for row in rows:
            products[row[0]] = {
                'title': row[1],
                'price': row[2],
                'category': row[3],
                'desc': row[4],
                'images': json.loads(row[5]) if row[5].startswith('["') else [row[5]],
                'deleted': bool(row[6])
            }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(products).encode())
    
    def save_product(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        product = json.loads(post_data.decode())
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Insert or replace
        c.execute('''INSERT OR REPLACE INTO products 
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (product['id'], product['title'], product['price'],
                   product['category'], product['desc'], json.dumps(product['images']),
                   int(product.get('deleted', False))))
        
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())
    
    def delete_product(self):
        product_id = self.path.split('/')[-1]
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('UPDATE products SET deleted = 1 WHERE id = ?', (product_id,))
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())
    
    def restore_product(self):
        product_id = self.path.split('/')[-1]
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('UPDATE products SET deleted = 0 WHERE id = ?', (product_id,))
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())
    
    def get_orders(self):
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('SELECT * FROM orders')
        rows = c.fetchall()
        conn.close()
        
        orders = []
        for row in rows:
            orders.append({
                'id': row[0],
                'date': row[1],
                'customer': json.loads(row[2]),
                'items': json.loads(row[3]),
                'total': row[4],
                'status': row[5]
            })
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(orders).encode())
    
    def create_order(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        order = json.loads(post_data.decode())
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute('''INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?)''',
                  (order['id'], order['date'], 
                   json.dumps(order['customer']), json.dumps(order['items']),
                   order['total'], order['status']))
        
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())
    
    def update_order(self):
        order_id = self.path.split('/')[-1]
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode())
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # If status is changing to Shipped, fetch order details first
        if data['status'] == 'Shipped':
            c.execute('SELECT customer_json FROM orders WHERE id = ?', (order_id,))
            result = c.fetchone()
            if result:
                customer = json.loads(result[0])
                email = customer.get('email', 'No email provided')
                print(f"\n--- SENDING EMAIL TO {email} ---")
                print(f"Subject: Your order #{order_id} has shipped!")
                print(f"Dear {customer.get('name', 'Customer')},")
                print("Your order has been shipped and will arrive within a week.")
                print("Thank you for shopping with us!")
                print("-----------------------------------\n")

        c.execute('UPDATE orders SET status = ? WHERE id = ?', 
                  (data['status'], order_id))
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())

if __name__ == '__main__':
    init_db()
    print('Initializing database...')
    print('Starting server on http://localhost:8001')
    print('Press Ctrl+C to stop the server')
    
    server = HTTPServer(('localhost', 8001), APIHandler)
    server.serve_forever()
