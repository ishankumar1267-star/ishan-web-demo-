/**
 * ═══════════════════════════════════════════════════════════
 *   Jyotish Kavach — API Bridge (rr-bridge.js)
 *   Bridges admin settings + product data to the frontend.
 *   Your Destiny, Your Kavach
 * ═══════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ─── Path Resolution ────────────────────────────────────────────────────────
    var pathParts       = window.location.pathname.split('/');
    var lastPart        = pathParts[pathParts.length - 1];
    var parentFolder    = pathParts[pathParts.length - 2];
    var isAdminFolder   = parentFolder === 'admin' || lastPart === 'admin';
    var basePath        = isAdminFolder ? '../' : './';
    var API_URL         = basePath + 'api.php';

    // ─── Admin Guard ─────────────────────────────────────────────────────────────
    var isLogin = window.location.pathname.includes('login.html');
    if (isAdminFolder && !isLogin) {
        var token = localStorage.getItem('rr_admin_token') || sessionStorage.getItem('rr_admin_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    }

    // ─── Site Defaults ───────────────────────────────────────────────────────────
    var DEFAULTS = {
        siteName:        'Jyotish Kavach',
        tagline:         'Your Destiny, Your Kavach',
        logoText:        'Jyotish Kavach',
        logoUrl:         '',
        favicon:         '',
        phone:           '+91 98765 43210',
        email:           'info@jyotishkavach.com',
        address:         '21, Spiritual Hub, Haridwar 249401, Uttarakhand',
        whatsapp:        '919876543210',
        facebook:        'https://facebook.com/jyotishkavach',
        instagram:       'https://instagram.com/jyotishkavach',
        youtube:         'https://youtube.com/jyotishkavach',
        primaryColor:    '#1a0a2e',
        accentColor:     '#c9a84c',
        maintenanceMode: false,
        googleMapUrl:    '',
        metaDesc:        'Jyotish Kavach — Authentic astrology products, rudrakshas, yantras, kavach, and gemstones. Your Destiny, Your Kavach.',
        heroBadge:       '🕉 Energised & Blessed Products',
        heroTitle:       'Align with the Cosmos',
        heroSubTitle:    'Jyotish Kavach',
        heroDesc:        'Discover authentic Kavach, Rudraksha, Yantra, and Gemstones — energised by Vedic scholars for your spiritual protection and prosperity.',
        heroCTA1Text:    '🛒 Shop Now',
        heroCTA1Link:    'shop.html',
        heroCTA2Text:    '📿 View Rudrakshas',
        heroCTA2Link:    'shop.html?category=rudraksha',
        banners:         [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=2000',
            'https://images.unsplash.com/photo-1518710843675-2540dd79065c?auto=format&fit=crop&q=80&w=2000'
        ]
    };

    window.rr_current_settings = Object.assign({}, DEFAULTS);

    // ─── Fetch Settings from API ─────────────────────────────────────────────────
    async function fetchSettings() {
        try {
            var res  = await fetch(API_URL + '?action=get&key=rr_site_settings');
            var text = await res.text();
            if (text && text !== 'null') {
                return Object.assign({}, DEFAULTS, JSON.parse(text));
            }
        } catch (e) { console.warn('JK Bridge: Could not load settings', e); }
        return Object.assign({}, DEFAULTS);
    }

    // ─── Save Settings to API ────────────────────────────────────────────────────
    async function saveSettings(updates) {
        var merged = Object.assign({}, window.rr_current_settings, updates);
        try {
            var headers = { 'Content-Type': 'application/json' };
            var t = localStorage.getItem('rr_admin_token') || sessionStorage.getItem('rr_admin_token');
            if (t) headers['X-Admin-Token'] = t;
            var res = await fetch(API_URL + '?action=set&key=rr_site_settings', {
                method: 'POST', headers: headers, body: JSON.stringify(merged)
            });
            if (!res.ok && res.status === 401 && isAdminFolder) {
                window.location.href = 'login.html';
            }
        } catch (e) { console.error('JK Bridge: Save error', e); }
        window.rr_current_settings = merged;
        applySettings(merged);
        document.dispatchEvent(new CustomEvent('rr_settings_updated', { detail: merged }));
        return merged;
    }

    // ─── Apply Settings to DOM ───────────────────────────────────────────────────
    function applySettings(s) {
        var root = document.documentElement;
        if (s.primaryColor) {
            root.style.setProperty('--color-primary',      s.primaryColor);
            root.style.setProperty('--color-primary-dark', s.primaryColor);
        }
        if (s.accentColor) {
            root.style.setProperty('--color-accent',       s.accentColor);
        }
        if (s.favicon) {
            var link = document.querySelector('link[rel="icon"]');
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
            link.href = s.favicon;
        }
        if (s.logoUrl) {
            document.querySelectorAll('.logo-icon, .logo-icon-footer, .logo-icon-admin').forEach(function (el) {
                el.innerHTML = '<img src="' + s.logoUrl + '" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">';
            });
        }
        if (s.logoText) {
            document.querySelectorAll('.logo-text-main, #sidebarLogoText').forEach(function (el) {
                el.textContent = s.logoText;
            });
        }
        if (s.tagline) {
            document.querySelectorAll('.logo-text-sub').forEach(function (el) {
                el.textContent = s.tagline.substring(0, 60);
            });
        }
        if (s.phone) {
            var clean = s.phone.replace(/\D/g, '');
            document.querySelectorAll('a[href^="tel:"]').forEach(function (el) { el.href = 'tel:+' + clean; });
            document.querySelectorAll('.footer-phone, .site-phone, [data-phone]').forEach(function (el) { el.textContent = s.phone; });
        }
        if (s.email) {
            document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) { el.href = 'mailto:' + s.email; });
            document.querySelectorAll('.footer-email, .site-email, [data-email]').forEach(function (el) { el.textContent = s.email; });
        }
        if (s.whatsapp) {
            document.querySelectorAll('a[href*="wa.me"], [data-social="whatsapp"]').forEach(function (el) {
                el.href = 'https://wa.me/' + s.whatsapp;
            });
        }
        ['facebook','instagram','youtube'].forEach(function (platform) {
            if (s[platform]) {
                document.querySelectorAll('[data-social="' + platform + '"]').forEach(function (el) {
                    el.href = s[platform];
                });
            }
        });
        if (s.address) {
            document.querySelectorAll('.footer-address, .site-address, [data-address]').forEach(function (el) {
                el.textContent = s.address;
            });
        }
        if (s.maintenanceMode === true && !isAdminFolder) {
            if (!document.getElementById('jkMaintOverlay')) {
                var ov = document.createElement('div');
                ov.id = 'jkMaintOverlay';
                ov.style.cssText = 'position:fixed;inset:0;background:linear-gradient(135deg,#1a0a2e,#2d1554);'
                    + 'z-index:99999;display:flex;align-items:center;justify-content:center;'
                    + 'flex-direction:column;color:#fff;text-align:center;padding:24px;font-family:Georgia,serif;';
                ov.innerHTML = '<div style="font-size:4rem;margin-bottom:16px;">🕉</div>'
                    + '<h1 style="color:#c9a84c;font-size:2rem;margin-bottom:12px;">' + s.siteName + '</h1>'
                    + '<h2 style="color:rgba(255,255,255,0.8);font-weight:500;margin-bottom:16px;">Website Under Maintenance</h2>'
                    + '<p style="opacity:0.75;max-width:400px;line-height:1.8;">We are updating our sacred store. Please check back soon.</p>'
                    + (s.whatsapp ? '<a href="https://wa.me/' + s.whatsapp + '" style="margin-top:24px;background:#25d366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">💬 WhatsApp Us</a>' : '');
                document.body.appendChild(ov);
            }
        } else {
            var ov2 = document.getElementById('jkMaintOverlay');
            if (ov2) ov2.remove();
        }
        if (s.googleMapUrl) {
            var mapEl = document.getElementById('googleMapFrame');
            if (mapEl) mapEl.src = s.googleMapUrl;
        }

        // Hero section
        var heroEl = document.getElementById('heroBannerSection');
        if (heroEl && s.heroBg) heroEl.style.backgroundImage = 'url("' + s.heroBg + '")';
        var hBadge = document.getElementById('heroBadgeText');
        if (hBadge && s.heroBadge) hBadge.textContent = s.heroBadge;
        var hTitle = document.getElementById('heroTitle');
        if (hTitle && s.heroTitle) hTitle.textContent = s.heroTitle;
        var hSub = document.getElementById('heroSubTitle');
        if (hSub && s.heroSubTitle) hSub.textContent = s.heroSubTitle;
        var hDesc = document.getElementById('heroDesc');
        if (hDesc && s.heroDesc) hDesc.textContent = s.heroDesc;
        var cta1 = document.getElementById('heroCTA1');
        if (cta1) {
            if (s.heroCTA1Text) cta1.textContent = s.heroCTA1Text;
            if (s.heroCTA1Link) cta1.href         = s.heroCTA1Link;
        }
        var cta2 = document.getElementById('heroCTA2');
        if (cta2) {
            if (s.heroCTA2Text) cta2.textContent = s.heroCTA2Text;
            if (s.heroCTA2Link) cta2.href         = s.heroCTA2Link;
        }

        // Admin form fields
        document.querySelectorAll('[data-setting]').forEach(function (el) {
            var key = el.dataset.setting;
            var val = s[key];
            if (val === undefined || val === null) return;
            if (el.type === 'checkbox') el.checked = (val === true || val === 'true');
            else el.value = val;
        });

        document.dispatchEvent(new CustomEvent('rr_dom_updated', { detail: s }));
    }

    // ═══════════════════════════════════════════════════════════
    // PRODUCT CARD TEMPLATE
    // ═══════════════════════════════════════════════════════════

    /**
     * buildProductCard(product) → HTML string
     * product: { id, slug, name, price, sale_price, images, badge, rating, review_count, category, short_desc }
     */
    function buildProductCard(p) {
        var imgSrc    = (p.images && p.images[0]) ? p.images[0] : 'https://placehold.co/400x400/f0ebff/1a0a2e?text=' + encodeURIComponent(p.name);
        var displayPrice = p.sale_price > 0 ? p.sale_price : p.price;
        var oldPrice     = p.sale_price > 0 ? p.price      : 0;

        var badgeHtml = '';
        if (p.badge) {
            var badgeClass = {
                'new':        'badge-new',
                'sale':       'badge-sale',
                'bestseller': 'badge-bestseller',
                'popular':    'badge-popular',
                'premium':    'badge-premium',
                'hot':        'badge-hot'
            }[p.badge] || 'badge-new';
            badgeHtml = '<span class="product-badge ' + badgeClass + '">' + p.badge.charAt(0).toUpperCase() + p.badge.slice(1) + '</span>';
        }

        var starsHtml = '';
        if (p.rating) {
            var full  = Math.floor(p.rating);
            var half  = (p.rating - full) >= 0.5;
            var empty = 5 - full - (half ? 1 : 0);
            starsHtml = '<div class="product-rating">';
            for (var i = 0; i < full;  i++) starsHtml += '<span class="star star-full">★</span>';
            if (half)                        starsHtml += '<span class="star star-half">½</span>';
            for (var j = 0; j < empty; j++) starsHtml += '<span class="star star-empty">☆</span>';
            starsHtml += ' <span class="rating-count">(' + (p.review_count || 0) + ')</span></div>';
        }

        var priceHtml = '<div class="product-price">'
            + '<span class="price-new">₹' + Number(displayPrice).toLocaleString('en-IN') + '</span>'
            + (oldPrice ? ' <span class="price-old">₹' + Number(oldPrice).toLocaleString('en-IN') + '</span>' : '')
            + '</div>';

        return '<div class="product-card fade-in" data-product-id="' + p.id + '">'
            + '  <div class="product-card-img">'
            +      badgeHtml
            + '    <img src="' + imgSrc + '" alt="' + p.name + '" loading="lazy">'
            + '    <div class="product-card-actions">'
            + '      <button class="btn-wishlist" data-wishlist-id="' + p.id + '" data-name="' + p.name + '" title="Add to Wishlist">'
            + '        <i data-lucide="heart"></i>'
            + '      </button>'
            + '    </div>'
            + '  </div>'
            + '  <div class="product-card-body">'
            + '    <p class="product-category">' + (p.category || '') + '</p>'
            + '    <h3 class="product-name"><a href="product.html?slug=' + p.slug + '">' + p.name + '</a></h3>'
            + '    ' + starsHtml
            + '    ' + priceHtml
            + '    <div class="product-card-footer">'
            + '      <a href="product.html?slug=' + p.slug + '" class="btn-view-product">View Details</a>'
            + '      <button class="btn-add-cart" data-product-id="' + p.id + '" data-name="' + p.name + '" data-price="' + displayPrice + '" data-image="' + imgSrc + '">'
            + '        <i data-lucide="shopping-cart"></i> Add'
            + '      </button>'
            + '    </div>'
            + '  </div>'
            + '</div>';
    }

    /**
     * bindProductCardEvents(container)
     * Binds Add to Cart and Wishlist buttons inside a rendered product grid.
     */
    function bindProductCardEvents(container) {
        container.querySelectorAll('.btn-add-cart').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var pid   = this.getAttribute('data-product-id');
                var name  = this.getAttribute('data-name');
                var price = parseFloat(this.getAttribute('data-price')) || 0;
                var img   = this.getAttribute('data-image') || '';
                if (typeof addToCart === 'function') addToCart(pid, name, price, img, 1);
            });
        });
        container.querySelectorAll('.btn-wishlist').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var pid  = this.getAttribute('data-wishlist-id');
                var name = this.getAttribute('data-name');
                if (typeof toggleWishlist === 'function') toggleWishlist(pid, name);
            });
        });
        // Re-init Lucide icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ═══════════════════════════════════════════════════════════
    // FEATURED PRODUCTS LOADER
    // ═══════════════════════════════════════════════════════════

    /**
     * loadFeaturedProducts(containerId)
     * Fetches ?action=get_products&featured=1 and renders into the element with given ID.
     */
    function loadFeaturedProducts(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="products-loading">Loading products…</div>';

        fetch(API_URL + '?action=get_products&featured=1')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!data.success || !data.products.length) {
                container.innerHTML = '<p class="no-products">No featured products found. <a href="javascript:void(0)" id="seedProductsLink">Seed sample products</a></p>';
                var seedLink = container.querySelector('#seedProductsLink');
                if (seedLink) {
                    seedLink.addEventListener('click', function () { seedProducts(containerId, 'featured'); });
                }
                return;
            }
            container.innerHTML = data.products.map(buildProductCard).join('');
            bindProductCardEvents(container);
        })
        .catch(function (e) {
            container.innerHTML = '<p class="load-error">Could not load products. Please try again.</p>';
            console.warn('JK Bridge: loadFeaturedProducts error', e);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ALL PRODUCTS LOADER (shop page)
    // ═══════════════════════════════════════════════════════════

    /**
     * loadAllProducts(containerId, filters)
     * filters: { category, search, featured }
     * Fetches products and renders into the given container.
     */
    function loadAllProducts(containerId, filters) {
        var container = document.getElementById(containerId);
        if (!container) return;

        filters = filters || {};
        var params = ['action=get_products'];
        if (filters.category && filters.category !== 'all') params.push('category=' + encodeURIComponent(filters.category));
        if (filters.search)   params.push('search='   + encodeURIComponent(filters.search));
        if (filters.featured) params.push('featured=1');

        container.innerHTML = '<div class="products-loading">Loading products…</div>';

        fetch(API_URL + '?' + params.join('&'))
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!data.success || !data.products.length) {
                container.innerHTML = '<p class="no-products">No products found for the selected filter.</p>';
                return;
            }
            container.innerHTML = data.products.map(buildProductCard).join('');
            bindProductCardEvents(container);
        })
        .catch(function (e) {
            container.innerHTML = '<p class="load-error">Could not load products. Please try again.</p>';
            console.warn('JK Bridge: loadAllProducts error', e);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // AUTO-LOAD ON SHOP PAGE (reads URL params)
    // ═══════════════════════════════════════════════════════════

    function autoLoadShopPage() {
        var shopGrid = document.getElementById('shopProductGrid');
        if (!shopGrid) return;

        var urlParams = new URLSearchParams(window.location.search);
        var filters   = {
            category: urlParams.get('category') || 'all',
            search:   urlParams.get('search')   || ''
        };
        loadAllProducts('shopProductGrid', filters);

        // Bind category filter buttons if present
        document.querySelectorAll('.shop-filter-btn[data-category]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.shop-filter-btn').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                var cat = this.getAttribute('data-category') || 'all';
                loadAllProducts('shopProductGrid', { category: cat, search: filters.search });
            });
        });

        // Active category from URL
        var activeCat = filters.category;
        if (activeCat && activeCat !== 'all') {
            var activeBtn = document.querySelector('.shop-filter-btn[data-category="' + activeCat + '"]');
            if (activeBtn) activeBtn.classList.add('active');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SEED HELPER (admin convenience, via script tag in admin)
    // ═══════════════════════════════════════════════════════════

    function seedProducts(containerId, reloadMode) {
        var t = localStorage.getItem('rr_admin_token') || sessionStorage.getItem('rr_admin_token');
        if (!t) { alert('Admin login required to seed products.'); return; }
        fetch(API_URL + '?action=seed_products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': t }
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                if (reloadMode === 'featured') loadFeaturedProducts(containerId);
                else                           loadAllProducts(containerId, {});
            } else {
                console.error('Seed error', data);
            }
        });
    }

    // ─── Expose Public API ───────────────────────────────────────────────────────
    window.rrSaveSettings       = saveSettings;
    window.rrGetSettings        = function () { return window.rr_current_settings; };
    window.saveSiteSettings     = saveSettings;
    window.getSiteSettings      = function () { return window.rr_current_settings; };
    window.loadFeaturedProducts = loadFeaturedProducts;
    window.loadAllProducts      = loadAllProducts;
    window.buildProductCard     = buildProductCard;
    window.bindProductCardEvents = bindProductCardEvents;
    window.jkSeedProducts       = seedProducts;

    // ─── Initialization ───────────────────────────────────────────────────────────
    async function init() {
        window.rr_current_settings = await fetchSettings();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                applySettings(window.rr_current_settings);
                autoLoadShopPage();
            });
        } else {
            applySettings(window.rr_current_settings);
            autoLoadShopPage();
        }
    }

    window.rrBridgePromise = init();

})();
