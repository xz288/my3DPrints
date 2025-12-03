// API-based Product Data Management

const API_BASE = 'http://localhost:8000/api';

// Fetch products from API
async function getProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return {};
    }
}

// Save product to API
async function saveProduct(id, productData) {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...productData })
        });
        if (!response.ok) throw new Error('Failed to save product');
        return await response.json();
    } catch (error) {
        console.error('Error saving product:', error);
        throw error;
    }
}

// Delete product (soft delete)
async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// Restore product
async function restoreProduct(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to restore product');
        return await response.json();
    } catch (error) {
        console.error('Error restoring product:', error);
        throw error;
    }
}

// Fetch orders from API
async function getOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// Save order to API
async function saveOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!response.ok) throw new Error('Failed to save order');
        return await response.json();
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update order');
        return await response.json();
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
}
