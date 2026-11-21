/* ============================================
   🕉️ Jyotish Kavach — Main JavaScript
   "Your Destiny, Your Kavach"
   ============================================ */

'use strict';

// ─── CART SYSTEM (localStorage key: 'jk_cart') ───
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('jk_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('jk_cart', JSON.stringify(cart));
  updateCartCountBadge();
}

function addToCart(productId, name, price, image, qty) {
  qty = parseInt(qty) || 1;
  const cart = getCart();
  const index = cart.findIndex(i => i.id === productId);
  if (index >= 0) {
    cart[index].qty += qty;
  } else {
    cart.push({ id: productId, name: name, price: price, image: image || '', qty: qty });
  }
  saveCart(cart);
  showToast('🛒 ' + name + ' added to sacred cart!', 'success');
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
}

function getCartTotal() {
  const cart = getCart();
  let subtotal = 0;
  let count = 0;
  cart.forEach(i => {
    subtotal += (i.price || 0) * (i.qty || 1);
    count += (i.qty || 1);
  });
  return { subtotal, count };
}

function updateCartCountBadge() {
  const total = getCartTotal();
  document.querySelectorAll('.cart-count, #cartCount').forEach(el => {
    el.textContent = total.count;
    el.style.display = total.count > 0 ? 'flex' : 'none';
  });
}

// ─── WISHLIST SYSTEM (localStorage key: 'jk_wishlist') ───
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('jk_wishlist') || '[]');
  } catch (e) {
    return [];
  }
}

function toggleWishlist(productId, name) {
  let list = getWishlist();
  const idx = list.findIndex(i => i.id === productId);
  let added = false;
  if (idx >= 0) {
    list.splice(idx, 1);
    showToast('Removed ' + name + ' from wishlist', 'info');
  } else {
    list.push({ id: productId, name: name });
    added = true;
    showToast('❤️ Added ' + name + ' to wishlist!', 'success');
  }
  localStorage.setItem('jk_wishlist', JSON.stringify(list));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const list = getWishlist();
  document.querySelectorAll('.wishlist-count, #wishlistCount').forEach(el => {
    el.textContent = list.length;
    el.style.display = list.length > 0 ? 'flex' : 'none';
  });
}

// ─── TOAST NOTIFICATIONS ───
function showToast(message, type) {
  type = type || 'success';
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'info') {
    toast.style.borderColor = '#93c5fd';
  } else if (type === 'error') {
    toast.style.borderColor = '#f87171';
  }
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ─── INITIALIZATION ON DOM READY ───
document.addEventListener('DOMContentLoaded', function () {

  // Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Update badges
  updateCartCountBadge();
  updateWishlistBadge();

  // Mobile navigation menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', function () {
      mainNav.classList.toggle('mobile-open');
    });
  }

  // Header Search action
  const searchBtn = document.getElementById('headerSearchBtn');
  const searchInput = document.getElementById('headerSearchInput');
  const searchCat = document.getElementById('headerCategorySelect');

  function triggerSearch() {
    const q = (searchInput ? searchInput.value.trim() : '');
    const cat = (searchCat ? searchCat.value : 'all');
    if (q || (cat && cat !== 'all')) {
      window.location.href = `shop.html?search=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}`;
    } else {
      window.location.href = 'shop.html';
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', triggerSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') triggerSearch();
    });
  }

  // Devotee session recognition
  try {
    const user = JSON.parse(localStorage.getItem('jk_user') || 'null');
    const userBtn = document.getElementById('userAccountBtn');
    const userText = document.getElementById('accountBtnText');
    if (user && user.isLoggedIn && userBtn && userText) {
      userBtn.href = 'my-account.html';
      userText.textContent = user.name ? user.name.split(' ')[0] : 'Account';
    }
  } catch (e) { }

  // Active page highlight in navigation (strictly ONE single link gets .active)
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const urlParams = new URLSearchParams(window.location.search);
  const currentCat = (urlParams.get('cat') || urlParams.get('category') || '').toLowerCase();

  const navLinks = document.querySelectorAll('.main-nav .nav-item-link');
  // First clear any existing active class to avoid multiple underlines
  navLinks.forEach(link => link.classList.remove('active'));

  let activeFound = false;

  if (currentPath === 'shop.html') {
    if (currentCat) {
      // 1. Try matching the exact category link first (e.g. shop.html?cat=kavach)
      navLinks.forEach(link => {
        if (activeFound) return;
        const rawHref = link.getAttribute('href') || '';
        if (rawHref.toLowerCase().includes('cat=' + currentCat) || rawHref.toLowerCase().includes('category=' + currentCat)) {
          link.classList.add('active');
          activeFound = true;
        }
      });
    }
    // 2. If no category matched or plain shop.html, activate "Shop Collection" only
    if (!activeFound) {
      navLinks.forEach(link => {
        if (activeFound) return;
        const rawHref = link.getAttribute('href') || '';
        const hrefBase = rawHref.split('?')[0].split('/').pop();
        if (hrefBase === 'shop.html' && !rawHref.includes('?')) {
          link.classList.add('active');
          activeFound = true;
        }
      });
    }
  } else {
    // 3. For all other pages (index, about, services, courses, blog, contact, etc.)
    navLinks.forEach(link => {
      if (activeFound) return;
      const rawHref = link.getAttribute('href') || '';
      const hrefFile = rawHref.split('?')[0].split('/').pop();
      if (hrefFile && (hrefFile === currentPath || (currentPath === '' && hrefFile === 'index.html'))) {
        link.classList.add('active');
        activeFound = true;
      }
    });
  }

  // --- Smooth Mouse Hand-Drag / Drag-to-Scroll for Navigation Bar ---
  const mainNavs = document.querySelectorAll('.main-nav');
  mainNavs.forEach(nav => {
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    // Prevent default browser link dragging (HTML5 dragstart) so mousemove fires continuously
    nav.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    // Initiate drag tracking on mousedown
    nav.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only primary left-click
      isDown = true;
      hasDragged = false;
      startX = e.clientX;
      scrollStart = nav.scrollLeft;
    });

    // Track movement on window so drag continues even if mouse leaves nav bounds vertically
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const walk = e.clientX - startX;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
        nav.classList.add('is-dragging');
        nav.scrollLeft = scrollStart - walk;
      }
    });

    // Release drag on window
    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      nav.classList.remove('is-dragging');
      // If user dragged, keep flag true briefly so the click event on the link is canceled
      if (hasDragged) {
        setTimeout(() => {
          hasDragged = false;
        }, 100);
      }
    });

    // Suppress link click only if user actually dragged (>4px); allow instant navigation on normal click
    nav.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    }, true);

    // Mouse wheel horizontal scrolling
    nav.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        nav.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  });

  // --- Universal Product Card Tap / Click Navigation (Mobile & Desktop) ---
  document.addEventListener('click', function (e) {
    // If the click is inside the Add to Cart button, Wishlist button, or an explicit link, do not hijack
    if (e.target.closest('.btn-add-cart') || e.target.closest('.btn-wishlist') || e.target.closest('button')) {
      return;
    }

    const card = e.target.closest('.product-card');
    if (card) {
      // If user tapped directly on an anchor tag inside the card, browser will handle it naturally
      if (e.target.closest('a')) return;

      // Find the destination link inside the card
      const link = card.querySelector('.product-title a, .product-name a, .product-img-wrapper a, a[href*="product.html"]');
      if (link && link.getAttribute('href')) {
        window.location.href = link.getAttribute('href');
      }
    }
  });

});
