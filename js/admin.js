// Admin Dashboard Logic

// Check for active session on load
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
});

// Login Form Handler
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'ZachZhang' && password === '123abcABC') {
        sessionStorage.setItem('admin_logged_in', 'true');
        showDashboard();
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    renderOrders();
    renderProducts();
}

function logout() {
    sessionStorage.removeItem('admin_logged_in');
    showLogin();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// --- Order Logic ---

async function renderOrders() {
    const tbody = document.getElementById('orders-table-body');
    let orders = await getOrders();

    // Get Filter/Sort Values
    const filterStatus = document.getElementById('filter-status').value;
    const sortBy = document.getElementById('sort-by').value;

    // Filter
    if (filterStatus !== 'All') {
        orders = orders.filter(order => order.status === filterStatus);
    }

    // Sort
    orders.sort((a, b) => {
        switch (sortBy) {
            case 'date-new':
                return new Date(b.date) - new Date(a.date);
            case 'date-old':
                return new Date(a.date) - new Date(b.date);
            case 'total-high':
                return parseFloat(b.total) - parseFloat(a.total);
            case 'total-low':
                return parseFloat(a.total) - parseFloat(b.total);
            default:
                return 0;
        }
    });

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No orders found.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.style.borderTop = '1px solid var(--color-border)';

        const itemsList = order.items.map(item =>
            `<div>${item.qty}x Product #${item.id}</div>`
        ).join('');

        const customerInfo = `
            <div>${order.customer.name}</div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted);">${order.customer.city}, ${order.customer.state}</div>
        `;

        tr.innerHTML = `
            <td style="padding: 1rem;">#${order.id.slice(-6)}</td>
            <td style="padding: 1rem;">${order.date}</td>
            <td style="padding: 1rem;">${customerInfo}</td>
            <td style="padding: 1rem;">${itemsList}</td>
            <td style="padding: 1rem;">$${order.total}</td>
            <td style="padding: 1rem;">
                <span style="
                    padding: 0.25rem 0.5rem; 
                    border-radius: 0.25rem; 
                    font-size: 0.85rem; 
                    background: ${order.status === 'Shipped' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; 
                    color: ${order.status === 'Shipped' ? '#10b981' : '#f59e0b'};
                ">
                    ${order.status}
                </span>
            </td>
            <td style="padding: 1rem;">
                ${order.status === 'Pending' ?
                `<button onclick="markShipped('${order.id}')" style="padding: 0.5rem; background: var(--color-primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Mark Shipped</button>`
                : '<span style="color: var(--color-text-muted);">-</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function markShipped(orderId) {
    try {
        await updateOrderStatus(orderId, 'Shipped');
        await renderOrders(); // Re-render to update UI
    } catch (error) {
        alert('Failed to update order status');
    }
}

async function resetData() {
    if (confirm('Are you sure you want to delete ALL order history? This cannot be undone.')) {
        // This would require a new API endpoint to clear all orders
        alert('This feature requires backend implementation');
    }
}

// --- Tab Logic ---
function switchTab(tabName) {
    const ordersView = document.getElementById('view-orders');
    const productsView = document.getElementById('view-products');
    const tabOrders = document.getElementById('tab-orders');
    const tabProducts = document.getElementById('tab-products');

    if (tabName === 'orders') {
        ordersView.style.display = 'block';
        productsView.style.display = 'none';
        tabOrders.style.borderBottomColor = 'var(--color-primary)';
        tabOrders.style.color = 'var(--color-primary)';
        tabProducts.style.borderBottomColor = 'transparent';
        tabProducts.style.color = 'var(--color-text-muted)';
    } else {
        ordersView.style.display = 'none';
        productsView.style.display = 'block';
        tabProducts.style.borderBottomColor = 'var(--color-primary)';
        tabProducts.style.color = 'var(--color-primary)';
        tabOrders.style.borderBottomColor = 'transparent';
        tabOrders.style.color = 'var(--color-text-muted)';
    }
}

// --- Product Logic ---
async function renderProducts() {
    const tbody = document.getElementById('products-table-body');
    const products = await getProducts();
    tbody.innerHTML = '';

    // Get Filters
    const statusFilter = document.getElementById('filter-prod-status').value;
    const categoryFilter = document.getElementById('filter-prod-category').value.toLowerCase();
    const priceFilter = parseFloat(document.getElementById('filter-prod-price').value);

    for (const id in products) {
        const p = products[id];
        const isDeleted = p.deleted === true;
        const price = parseFloat(p.price.replace('$', ''));

        // Filter Logic
        if (statusFilter === 'Active' && isDeleted) continue;
        if (statusFilter === 'Deleted' && !isDeleted) continue;
        if (categoryFilter && !p.category.toLowerCase().includes(categoryFilter)) continue;
        if (!isNaN(priceFilter) && price > priceFilter) continue;

        const tr = document.createElement('tr');
        tr.style.borderTop = '1px solid var(--color-border)';
        tr.style.opacity = isDeleted ? '0.5' : '1';

        const statusBadge = isDeleted
            ? '<span style="padding: 0.25rem 0.5rem; background: rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 0.25rem; font-size: 0.85rem;">Deleted</span>'
            : '<span style="padding: 0.25rem 0.5rem; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 0.25rem; font-size: 0.85rem;">Active</span>';

        const actionBtn = isDeleted
            ? `<button onclick="restoreProductBtn('${id}')" style="padding: 0.5rem; background: var(--color-primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Restore</button>`
            : `<button onclick="deleteProductBtn('${id}')" style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Delete</button>`;

        tr.innerHTML = `
            <td style="padding: 1rem; font-size: 2rem;">
                ${p.images[0].startsWith('data:') ? `<img src="${p.images[0]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.5rem;">` : p.images[0]}
            </td>
            <td style="padding: 1rem; font-family: monospace; font-size: 0.9rem;">${id}</td>
            <td style="padding: 1rem; font-weight: 600;">${p.title}</td>
            <td style="padding: 1rem;">${p.price}</td>
            <td style="padding: 1rem;">${p.category}</td>
            <td style="padding: 1rem;">${statusBadge}</td>
            <td style="padding: 1rem;">
                <button onclick="editProductBtn('${id}')" style="padding: 0.5rem; margin-right: 0.5rem; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 0.25rem; cursor: pointer;">Edit</button>
                ${actionBtn}
            </td>
        `;
        tbody.appendChild(tr);
    }
}

// Modal Logic
let currentImages = ['', '', '', '']; // Store current images for the modal

async function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');

    modal.style.display = 'flex';
    currentImages = ['', '', '', '']; // Reset images

    if (productId) {
        // Edit Mode
        const products = await getProducts();
        const p = products[productId];
        title.textContent = 'Edit Product';
        document.getElementById('prod-id').value = productId;
        document.getElementById('prod-title').value = p.title;
        document.getElementById('prod-price').value = parseFloat(p.price.replace('$', ''));
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-desc').value = p.desc;

        // Load existing images
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach((img, i) => {
                if (i < 4) currentImages[i] = img;
            });
        }
    } else {
        // Add Mode
        title.textContent = 'Add New Product';
        form.reset();
        document.getElementById('prod-id').value = '';
    }

    renderImageSlots();
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function renderImageSlots() {
    const grid = document.getElementById('image-grid');
    grid.innerHTML = '';

    currentImages.forEach((img, index) => {
        const slot = document.createElement('div');
        slot.style.border = '1px dashed var(--color-border)';
        slot.style.borderRadius = '0.5rem';
        slot.style.height = '150px';
        slot.style.display = 'flex';
        slot.style.flexDirection = 'column';
        slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center';
        slot.style.position = 'relative';
        slot.style.overflow = 'hidden';
        slot.style.background = 'var(--color-bg)';

        if (img) {
            // Filled State
            if (img.startsWith('data:') || img.startsWith('http')) {
                slot.innerHTML = `
                    <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button type="button" onclick="removeImage(${index})" 
                        style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
                `;
            } else {
                // Emoji
                slot.innerHTML = `
                    <div style="font-size: 4rem;">${img}</div>
                    <button type="button" onclick="removeImage(${index})" 
                        style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
                `;
            }
        } else {
            // Empty State
            slot.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 0.5rem;">
                    <button type="button" onclick="document.getElementById('file-input-${index}').click()" 
                        style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; margin-bottom: 0.5rem; font-size: 0.8rem;">Upload</button>
                    <input type="file" id="file-input-${index}" accept="image/*" style="display: none;" onchange="handleFileUpload(${index}, this)">
                    <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">- OR -</div>
                    <input type="text" placeholder="URL/Emoji" onchange="handleUrlInput(${index}, this.value)"
                        style="width: 80%; padding: 0.25rem; border: 1px solid var(--color-border); border-radius: 0.25rem; background: var(--color-surface); color: var(--color-text); font-size: 0.8rem; text-align: center;">
                </div>
            `;
        }
        grid.appendChild(slot);
    });
}

function removeImage(index) {
    currentImages[index] = '';
    renderImageSlots();
}

function handleUrlInput(index, value) {
    if (value.trim()) {
        currentImages[index] = value.trim();
        renderImageSlots();
    }
}

function handleFileUpload(index, input) {
    const file = input.files[0];
    if (file) {
        if (file.size > 500 * 1024) {
            alert('Image is too large! Max 500KB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            currentImages[index] = e.target.result;
            renderImageSlots();
        };
        reader.readAsDataURL(file);
    }
}

// Handle Form Submit
document.getElementById('product-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('prod-id').value || Date.now().toString();
    const title = document.getElementById('prod-title').value;
    const price = parseFloat(document.getElementById('prod-price').value).toFixed(2);
    const category = document.getElementById('prod-category').value;
    const desc = document.getElementById('prod-desc').value;

    // Filter out empty images
    const validImages = currentImages.filter(img => img !== '');

    if (validImages.length === 0) {
        alert('Please provide at least one image.');
        return;
    }

    const productData = {
        title: title,
        price: '$' + price,
        desc: desc,
        images: validImages,
        category: category,
        deleted: false
    };

    try {
        await saveProduct(id, productData);
        closeProductModal();
        await renderProducts();
        alert('Product saved successfully!');
    } catch (error) {
        alert('Failed to save product');
        console.error(error);
    }
});

async function editProductBtn(id) {
    await openProductModal(id);
}

async function deleteProductBtn(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteProduct(id);
            await renderProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    }
}

async function restoreProductBtn(id) {
    try {
        await restoreProduct(id);
        await renderProducts();
    } catch (error) {
        alert('Failed to restore product');
    }
}
