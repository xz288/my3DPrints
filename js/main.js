console.log("3D Prints Store Loaded");

// Handle Intro Animation cleanup if needed (CSS handles most of it)
const DAILY_PICK_COUNT = 3;
const TRENDING_COUNT = 3;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Intro Animation Cleanup
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    overlay.addEventListener('animationend', () => {
      overlay.style.display = 'none';
    });
  }

  // 2. Load Products
  const productsDict = await getProducts();
  const allProducts = Object.values(productsDict).filter(p => !p.deleted);

  // 3. Populate Picks of the Day
  const dailyPicksContainer = document.getElementById('daily-picks-grid');
  if (dailyPicksContainer && allProducts.length > 0) {
    // Randomly select 3
    const picks = getRandomSubarray(allProducts, DAILY_PICK_COUNT);
    renderDailyPicks(dailyPicksContainer, picks);
  } else if (dailyPicksContainer) {
    dailyPicksContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products available.</p>';
  }

  // 4. Populate Trending
  const trendingContainer = document.getElementById('trending-table-body');
  if (trendingContainer && allProducts.length > 0) {
    // Randomly select 3 (independent of picks for now, or could ensure unique)
    // Let's just shuffle again for randomness
    const trending = getRandomSubarray(allProducts, TRENDING_COUNT);
    renderTrending(trendingContainer, trending);
  } else if (trendingContainer) {
    trendingContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem;">No products available.</td></tr>';
  }
});

/**
 * Get random subarray of size n
 */
function getRandomSubarray(arr, size) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

/**
 * Render Daily Picks Grid
 */
function renderDailyPicks(container, products) {
  container.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id}" class="card"
            style="background: var(--color-surface); border-radius: 1rem; overflow: hidden; transition: transform 0.3s ease; text-decoration: none; color: inherit;">
            <div style="height: 300px; background: #334155; display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                ${product.images[0]}
            </div>
            <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${product.title}</h3>
                <p style="color: var(--color-text-muted);">${product.category}</p>
                <div style="margin-top: 1rem; font-weight: 600; color: var(--color-primary);">${product.price}</div>
            </div>
        </a>
    `).join('');
}

/**
 * Render Trending List Table
 */
function renderTrending(container, products) {
  container.innerHTML = products.map((product, index) => `
        <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 1.5rem; font-weight: 700; color: var(--color-accent);">#${index + 1}</td>
            <td style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; background: #334155; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        ${product.images[0]}
                    </div>
                    <span style="font-weight: 600;">${product.title}</span>
                </div>
            </td>
            <td style="padding: 1.5rem; color: var(--color-text-muted);">${product.category}</td>
            <td style="padding: 1.5rem;">${product.price}</td>
            <td style="padding: 1.5rem;">
                <a href="product.html?id=${product.id}" style="color: var(--color-primary); font-weight: 500;">View &rarr;</a>
            </td>
        </tr>
    `).join('');
}
