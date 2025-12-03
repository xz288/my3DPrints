// Cart Logic

// Key for localStorage
const CART_KEY = 'caspers_3d_hut_cart';

// Get cart from local storage
function getCart() {
    const cartJson = localStorage.getItem(CART_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

// Save cart to local storage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(id) {
    id = String(id);
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id: id, qty: 1 });
    }

    saveCart(cart);
    alert('Item added to cart!');
}

// Remove item from cart
function removeFromCart(id) {
    id = String(id);
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    renderCart(); // Re-render if on cart page
}

// Update item quantity
function updateQuantity(id, qty) {
    id = String(id);
    const cart = getCart();
    const item = cart.find(item => item.id === id);

    if (item) {
        item.qty = parseInt(qty);
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
    }

    saveCart(cart);
    renderCart(); // Re-render if on cart page
}

// Calculate total price
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const product = products[item.id];
        if (product) {
            const price = parseFloat(product.price.replace('$', ''));
            return total + (price * item.qty);
        }
        return total;
    }, 0);
}

// Update Cart Count in Navigation
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    const cartLink = document.querySelector('nav a[href="cart.html"]');
    if (cartLink) {
        cartLink.textContent = `Cart (${totalItems})`;
    } else {
        // Fallback if looking for the generic link in other pages before update
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            if (link.textContent.includes('Cart')) {
                link.textContent = `Cart (${totalItems})`;
                link.href = 'cart.html'; // Ensure it links to cart.html
            }
        });
    }
}

// Render Cart Items (for cart.html)
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartSubtotalElement = document.getElementById('cart-subtotal');

    if (!cartContainer || !cartTotalElement) return; // Not on cart page

    const cart = getCart();
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="padding: 3rem; text-align: center; color: var(--color-text-muted); font-size: 1.1rem;">Your cart is empty.</p>';
        cartTotalElement.textContent = '$0.00';
        if (cartSubtotalElement) cartSubtotalElement.textContent = '$0.00';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const product = products[item.id];
        if (!product) return;

        const price = parseFloat(product.price.replace('$', ''));
        const itemTotal = price * item.qty;
        total += itemTotal;

        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '150px 1fr auto auto'; // Increased first column for big icon
        row.style.gap = '1.5rem';
        row.style.alignItems = 'center';
        row.style.padding = '1.5rem';
        row.style.borderBottom = '1px solid var(--color-border)';

        row.innerHTML = `
            <div style="width: 150px; height: 150px; background: #334155; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 6rem;">
                ${product.images[0]}
            </div>
            <div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${product.title}</h3>
                <p style="color: var(--color-text-muted); font-size: 1.1rem;">${product.price}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="updateQuantity('${item.id}', ${item.qty - 1})" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 0.25rem; cursor: pointer; font-size: 1.2rem;">-</button>
                <span style="width: 24px; text-align: center; font-weight: 600;">${item.qty}</span>
                <button onclick="updateQuantity('${item.id}', ${item.qty + 1})" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 0.25rem; cursor: pointer; font-size: 1.2rem;">+</button>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; font-size: 1.2rem; margin-bottom: 0.25rem;">$${itemTotal.toFixed(2)}</div>
                <button onclick="removeFromCart('${item.id}')" style="color: #ef4444; background: none; border: none; font-size: 1rem; cursor: pointer; text-decoration: underline;">Remove</button>
            </div>
        `;

        cartContainer.appendChild(row);
    });

    const formattedTotal = `$${total.toFixed(2)}`;
    cartTotalElement.textContent = formattedTotal;
    if (cartSubtotalElement) cartSubtotalElement.textContent = formattedTotal;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
});
