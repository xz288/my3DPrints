const shopGrid = document.getElementById('shop-grid');

async function renderShop() {
  const products = await getProducts();
  shopGrid.innerHTML = '';

  Object.entries(products).forEach(([id, product]) => {
    if (product.deleted) return; // Skip deleted products

    const card = document.createElement('a');
    card.href = `product.html?id=${id}`;
    card.className = 'card';
    card.style.cssText = `
            background: var(--color-surface);
            border-radius: 1rem;
            overflow: hidden;
            transition: transform 0.3s ease;
            display: block;
            text-decoration: none;
            color: inherit;
        `;

    card.innerHTML = `
            <div style="height: 250px; background: #334155; display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                ${product.images[0].startsWith('data:') ? `<img src="${product.images[0]}" style="width: 100%; height: 100%; object-fit: cover;">` : product.images[0]}
            </div>
            <div style="padding: 1.5rem;">
                <div style="font-size: 0.8rem; color: var(--color-primary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${product.category || 'Item'}</div>
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${product.title}</h3>
                <div style="font-weight: 600; color: var(--color-text-muted);">${product.price}</div>
            </div>
        `;

    // Add hover effect via JS since inline styles are tricky for pseudo-classes
    card.onmouseenter = () => card.style.transform = 'translateY(-5px)';
    card.onmouseleave = () => card.style.transform = 'translateY(0)';

    shopGrid.appendChild(card);
  });
}

// Initial Render
renderShop();
