const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const sliderContainer = document.querySelector('.slider-container');

let currentSlide = 0;
const totalSlides = slides.length;

function showSlide(index) {
    // Update slider transform
    sliderContainer.style.transform = `translateX(-${index * 100}%)`;
    
    // Update active classes
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    // Show cart button only on slide 2 (index 1)
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.style.display = index === 1 ? 'flex' : 'none';

    // Hide "Kembali" on first slide, "Lanjut" on last slide
    prevBtn.style.display = index === 0 ? 'none' : 'flex';
    nextBtn.style.display = index === totalSlides - 1 ? 'none' : 'flex';
    
    currentSlide = index;
}

function nextSlide() {
    let next = currentSlide + 1;
    if (next >= totalSlides) next = 0;
    showSlide(next);
}

function prevSlide() {
    let prev = currentSlide - 1;
    if (prev < 0) prev = totalSlides - 1;
    showSlide(prev);
}

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

// Touch swipe (mobile)
let startX = 0;
let endX = 0;

sliderContainer.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

sliderContainer.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextSlide(); // Swipe left
    if (endX - startX > 50) prevSlide(); // Swipe right
});

// Optional auto-advance (disabled for minimalism)
// setInterval(nextSlide, 5000);

console.log('Slider ready! Use arrows, dots, swipe, or keys.');

// ============ ORDER & CART SYSTEM ============

let cart = [];
let currentOrderItem = null;

// Initialize cart from localStorage with error handling
function initializeCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const count = cart.length;
    document.getElementById('cartCount').textContent = count;
}

// Add event listeners to menu items instead of inline onclick
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Prevent opening modal if clicking on the image
        if (e.target.tagName !== 'IMG') {
            openOrderModal(this);
        }
    });
});

// Open order modal
function openOrderModal(element) {
    currentOrderItem = element;
    const name = element.dataset.name;
    const priceStr = element.dataset.price;
    
    // Validate price data
    const price = parseInt(priceStr);
    if (isNaN(price) || price < 0) {
        console.error('Invalid price:', priceStr);
        alert('Ada masalah dengan data harga produk. Silakan hubungi pemilik toko.');
        return;
    }

    let partSelection = '';
    if (name === 'Ayam Penyet Sambel Ijo' || name === 'Ayam Penyet + Nasi') {
        partSelection = `
            <div class="part-selection">
                <p>Pilih bagian ayam:</p>
                <label><input type="radio" name="chickenPart" value="Dada" checked>Dada</label>
                <label><input type="radio" name="chickenPart" value="Paha">Paha</label>
            </div>
        `;
    }
    
    document.getElementById('orderDetails').innerHTML = `
        <h3>${escapeHtml(name)}</h3>
        <p style="font-size: 1.2rem; color: #FFD700;">Rp. ${price.toLocaleString('id-ID')}</p>
        ${partSelection}
    `;
    
    document.getElementById('qtyInput').value = 1;
    document.getElementById('orderModal').style.display = 'block';
}

// HTML escape function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Quantity controls with validation
document.getElementById('qtyPlus')?.addEventListener('click', () => {
    const input = document.getElementById('qtyInput');
    let value = parseInt(input.value) || 1;
    value = Math.max(1, value + 1);
    input.value = value;
});

document.getElementById('qtyMinus')?.addEventListener('click', () => {
    const input = document.getElementById('qtyInput');
    let value = parseInt(input.value) || 1;
    value = Math.max(1, value - 1);
    input.value = value;
});

// Validate quantity input on change
document.getElementById('qtyInput')?.addEventListener('change', function() {
    let value = parseInt(this.value) || 1;
    value = Math.max(1, value);
    this.value = value;
});
document.getElementById('qtyInput')?.addEventListener('blur', function() {
    let value = parseInt(this.value) || 1;
    value = Math.max(1, value);
    this.value = value;
});

// Add to cart
document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    if (!currentOrderItem) return;

    const name = currentOrderItem.dataset.name;
    const priceStr = currentOrderItem.dataset.price;
    const qty = parseInt(document.getElementById('qtyInput').value) || 1;

    // Validate price
    const price = parseInt(priceStr);
    if (isNaN(price) || price < 0) {
        console.error('Invalid price:', priceStr);
        alert('Ada masalah dengan data harga. Silakan coba lagi.');
        return;
    }

    let part = '';
    const partInput = document.querySelector('input[name="chickenPart"]:checked');
    if (partInput) {
        part = partInput.value;
    }

    let itemName = name;
    if (part) {
        itemName += ` (${part})`;
    }

    const cartItem = {
        id: Date.now(),
        name: itemName,
        price: price,
        qty: qty,
        part: part,
        total: price * qty
    };

    cart.push(cartItem);
    
    // Save to localStorage with error handling
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        alert('Gagal menyimpan pesanan. Coba refresh halaman.');
        cart.pop(); // Remove the item we just added
        return;
    }
    
    updateCartCount();

    // Close modal
    document.getElementById('orderModal').style.display = 'none';

    const partInfo = part ? ` (${part})` : '';
    alert(`${name}${partInfo} (${qty}x) ditambahkan ke keranjang!`);
});

// Open invoice modal
document.getElementById('cartBtn')?.addEventListener('click', () => {
    updateInvoiceDisplay();
    document.getElementById('invoiceModal').style.display = 'block';
});

// Update invoice display
function updateInvoiceDisplay() {
    const invoiceContent = document.getElementById('invoiceContent');
    
    if (cart.length === 0) {
        invoiceContent.innerHTML = '<p class="empty-cart-text">Keranjang kosong</p>';
        return;
    }
    
    let html = '';
    let grandTotal = 0;
    
    cart.forEach((item) => {
        grandTotal += item.total;
        html += `
            <div class="invoice-item">
                <span class="invoice-item-name">${escapeHtml(item.name)}</span>
                <span class="invoice-item-qty">${item.qty}x</span>
                <span class="invoice-item-price">Rp. ${item.total.toLocaleString('id-ID')}</span>
                <button class="invoice-item-remove" data-item-id="${item.id}">Hapus</button>
            </div>
        `;
    });
    
    html += `
        <div class="invoice-total">
            <div class="invoice-total-label">Total Pesanan:</div>
            <div class="invoice-total-amount">Rp. ${grandTotal.toLocaleString('id-ID')}</div>
        </div>
    `;
    
    invoiceContent.innerHTML = html;
    
    // Add event delegation for remove buttons
    invoiceContent.querySelectorAll('.invoice-item-remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = parseInt(this.dataset.itemId);
            removeFromCart(itemId);
        });
    });
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
    
    updateCartCount();
    updateInvoiceDisplay();
}

// Clear cart
document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    if (confirm('Hapus semua pesanan?')) {
        cart = [];
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error clearing cart from localStorage:', error);
        }
        updateCartCount();
        updateInvoiceDisplay();
    }
});

// Send via WhatsApp
document.getElementById('sendWABtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    
    let message = '🍗 *Pesanan Ayam Penyet Sambel Ijo* 🌶️\n\n';
    let grandTotal = 0;
    
    cart.forEach((item) => {
        message += `🔸 ${item.name}\n   ${item.qty}x @ Rp. ${item.price.toLocaleString('id-ID')} = Rp. ${item.total.toLocaleString('id-ID')}\n\n`;
        grandTotal += item.total;
    });
    
    message += `━━━━━━━━━━━━━━━━━━━━━━\n*TOTAL: Rp. ${grandTotal.toLocaleString('id-ID')}*\n\nTerima kasih! 🙏`;
    
    const waNumber = '6282213802266';
    const encodedMessage = encodeURIComponent(message);
    
    try {
        window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('Error opening WhatsApp:', error);
        alert('Gagal membuka WhatsApp. Cek koneksi internet Anda.');
    }
});

// Modal close handlers
document.getElementById('closeOrder')?.addEventListener('click', () => {
    document.getElementById('orderModal').style.display = 'none';
});

document.getElementById('closeInvoice')?.addEventListener('click', () => {
    document.getElementById('invoiceModal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const orderModal = document.getElementById('orderModal');
    const invoiceModal = document.getElementById('invoiceModal');
    
    if (e.target === orderModal) {
        orderModal.style.display = 'none';
    }
    if (e.target === invoiceModal) {
        invoiceModal.style.display = 'none';
    }
});

// Initialize cart count on page load
initializeCart();

// Initialize first slide display
showSlide(0);
