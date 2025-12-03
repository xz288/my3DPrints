// Product Detail Page Logic

// Get Product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id') || '1'; // Default to '1' if none

// DOM Elements
const titleEl = document.getElementById('product-title');
const priceEl = document.getElementById('product-price');
const descEl = document.getElementById('product-desc');
const mainImageEl = document.getElementById('main-image-display');
const thumbnailListEl = document.getElementById('thumbnail-list');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentsListEl = document.getElementById('comments-list');
const addToCartBtn = document.getElementById('add-to-cart-btn');

let currentProduct = null;

// Initialize Page
async function initProductPage() {
    const products = await getProducts();
    currentProduct = products[productId];

    if (currentProduct) {
        // Set Info
        titleEl.textContent = currentProduct.title;
        priceEl.textContent = currentProduct.price;
        descEl.textContent = currentProduct.desc;
        document.title = `${currentProduct.title} - Blake&Casper's 3D Hut`;

        // Initialize Gallery
        renderGallery();

        // Initialize Comments
        renderComments();
    } else {
        titleEl.textContent = "Product Not Found";
        descEl.textContent = "The item you are looking for does not exist.";
        priceEl.textContent = "";
    }
}

// Gallery Logic
function renderGallery() {
    if (!currentProduct) return;

    const imageUrl = currentProduct.images[0];

    // Clear the main image area first
    mainImageEl.innerHTML = '';

    // Check if it's a Base64 image
    if (imageUrl.startsWith('data:')) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        mainImageEl.appendChild(img);
    } else {
        // Emoji or text
        mainImageEl.textContent = imageUrl;
    }

    thumbnailListEl.innerHTML = '';
    currentProduct.images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumb ${index === 0 ? 'active' : ''}`;

        if (img.startsWith('data:')) {
            const thumbImg = document.createElement('img');
            thumbImg.src = img;
            thumbImg.style.width = '100%';
            thumbImg.style.height = '100%';
            thumbImg.style.objectFit = 'cover';
            thumb.appendChild(thumbImg);
        } else {
            thumb.textContent = img;
        }

        thumb.onclick = () => {
            // Clear the main image area
            mainImageEl.innerHTML = '';

            // Update Main Image
            if (img.startsWith('data:')) {
                const mainImg = document.createElement('img');
                mainImg.src = img;
                mainImg.style.width = '100%';
                mainImg.style.height = '100%';
                mainImg.style.objectFit = 'contain';
                mainImageEl.appendChild(mainImg);
            } else {
                mainImageEl.textContent = img;
            }

            // Update Active State
            document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };
        thumbnailListEl.appendChild(thumb);
    });
}

// Comment Logic
function getComments() {
    const stored = localStorage.getItem(`comments_${productId}`);
    return stored ? JSON.parse(stored) : [];
}

function saveComment(text) {
    const comments = getComments();
    const newComment = {
        text,
        date: new Date().toLocaleDateString(),
        id: Date.now()
    };
    comments.unshift(newComment); // Add to top
    localStorage.setItem(`comments_${productId}`, JSON.stringify(comments));
    renderComments();
}

function renderComments() {
    const comments = getComments();

    if (comments.length === 0) {
        commentsListEl.innerHTML = '<div style="text-align: center; color: var(--color-text-muted);">No comments yet. Be the first!</div>';
        return;
    }

    commentsListEl.innerHTML = comments.map(c => `
    <div class="comment">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 600; color: var(--color-primary);">Anonymous User</span>
        <span style="color: var(--color-text-muted); font-size: 0.9rem;">${c.date}</span>
      </div>
      <p style="color: var(--color-text);">${c.text}</p>
    </div>
  `).join('');
}

// Event Listeners
commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = commentInput.value.trim();
    if (text) {
        saveComment(text);
        commentInput.value = '';
    }
});

// Add to Cart
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
        addToCart(productId);
    });
}

// Initialize on page load
(async () => {
    try {
        console.log('Starting product page initialization...');
        await initProductPage();
        console.log('Product page initialization complete!');
    } catch (error) {
        console.error('Error initializing product page:', error);
        titleEl.textContent = 'Error Loading Product';
        descEl.textContent = 'Failed to load product data. Please check the console for details.';
        priceEl.textContent = '';
    }
})();
