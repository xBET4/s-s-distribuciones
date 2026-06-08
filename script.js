document.addEventListener('DOMContentLoaded', () => {

    // ── Elementos generales ──────────────────────────────────────────────
    const filterBtns     = document.querySelectorAll('.filter-btn');
    const searchBar      = document.getElementById('searchBar');
    const productCards   = document.querySelectorAll('.product-card');
    const noResultsMsg   = document.getElementById('noResults');
    const themeToggle    = document.getElementById('theme-toggle');

// ── Elementos del carrito ────────────────────────────────────────────
    const cartToggle     = document.getElementById('cart-toggle');
    const cartPanel      = document.getElementById('cartPanel');
    const cartOverlay    = document.getElementById('cartOverlay');
    const cartClose      = document.getElementById('cartClose');
    const cartCount      = document.getElementById('cartCount');
    const cartBody       = document.getElementById('cartBody');
    const cartEmpty      = document.getElementById('cartEmpty');
    const cartItemsList  = document.getElementById('cartItems');
    const cartTotalEl    = document.getElementById('cartTotal');
    const clearCartBtn   = document.getElementById('clearCart');
    const sendBtn        = document.getElementById('sendWhatsapp1');
    // Se eliminaron las 3 líneas de los links y opciones de WhatsApp

    // ── Estado del carrito ───────────────────────────────────────────────
    // cart = { id: { name, price, qty, isConsultar } }
    const cart = {};

    // ── ABRIR / CERRAR CARRITO ───────────────────────────────────────────
    function openCart() {
        cartPanel.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        cartPanel.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
        waOptions.style.display = 'none';
    }

    cartToggle.addEventListener('click', () => cartPanel.classList.contains('open') ? closeCart() : openCart());
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ── AGREGAR AL CARRITO ───────────────────────────────────────────────
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const name = card.querySelector('h3').innerText;
            const desc = card.querySelector('p').innerText;
            const priceRaw = parseFloat(card.getAttribute('data-price')) || 0;
            const priceText = card.querySelector('.price').innerText;
            const isConsultar = priceRaw === 0;

            // ID único basado en nombre + descripción
            const id = (name + desc).replace(/\s+/g, '_').toLowerCase();

            if (cart[id]) {
                cart[id].qty++;
            } else {
                cart[id] = { name, desc, price: priceRaw, qty: 1, isConsultar, priceText };
            }

            renderCart();
            animateAddBtn(btn);
            bumpCount();
        });
    });

    function animateAddBtn(btn) {
        btn.classList.add('added');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Agregar';
        }, 1000);
    }

    function bumpCount() {
        cartCount.classList.remove('bump');
        void cartCount.offsetWidth; // reflow
        cartCount.classList.add('bump');
        setTimeout(() => cartCount.classList.remove('bump'), 300);
    }

    // ── RENDERIZAR CARRITO ───────────────────────────────────────────────
    function renderCart() {
        cartItemsList.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        const ids = Object.keys(cart);

        if (ids.length === 0) {
            cartEmpty.classList.remove('hide');
        } else {
            cartEmpty.classList.add('hide');
        }

        ids.forEach(id => {
            const item = cart[id];
            totalItems += item.qty;
            if (!item.isConsultar) total += item.price * item.qty;

            const subtotal = item.isConsultar
                ? 'Consultar precio'
                : `$${(item.price * item.qty).toFixed(2)}`;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">${item.desc} · ${subtotal}</span>
                <div class="cart-item-controls">
                    <button class="qty-btn remove-btn" data-id="${id}" title="Quitar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <button class="qty-btn" data-action="dec" data-id="${id}">−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" data-action="inc" data-id="${id}">+</button>
                </div>
            `;
            cartItemsList.appendChild(li);
        });

        cartCount.textContent = totalItems;
        cartTotalEl.textContent = `$${total.toFixed(2)}`;

        // Eventos de controles dentro del carrito
        cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const action = this.getAttribute('data-action');
                if (this.classList.contains('remove-btn')) {
                    delete cart[id];
                } else if (action === 'inc') {
                    cart[id].qty++;
                } else if (action === 'dec') {
                    cart[id].qty--;
                    if (cart[id].qty <= 0) delete cart[id];
                }
                renderCart();
            });
        });
    }

    // ── VACIAR CARRITO ───────────────────────────────────────────────────
    clearCartBtn.addEventListener('click', () => {
        if (Object.keys(cart).length === 0) return;
        if (confirm('¿Seguro que quieres vaciar el carrito?')) {
            Object.keys(cart).forEach(k => delete cart[k]);
            renderCart();
            // Eliminada la línea de waOptions
        }
    });
    // ── GENERAR MENSAJE WHATSAPP ─────────────────────────────────────────
    function buildWhatsAppMessage() {
        const ids = Object.keys(cart);
        if (ids.length === 0) return null;

        let msg = '🛒 *PEDIDO S&S DISTRIBUCIONES*\n';
        msg += '─────────────────────\n';

        let total = 0;
        let hasConsultar = false;

        ids.forEach((id, i) => {
            const item = cart[id];
            const lineTotal = item.isConsultar
                ? '(consultar precio)'
                : `$${(item.price * item.qty).toFixed(2)}`;
            if (!item.isConsultar) total += item.price * item.qty;
            if (item.isConsultar) hasConsultar = true;

            msg += `${i + 1}. *${item.name}*\n`;
            msg += `   • ${item.desc}\n`;
            msg += `   • Cantidad: ${item.qty} → ${lineTotal}\n`;
        });

        msg += '─────────────────────\n';
        msg += `💰 *Total estimado: $${total.toFixed(2)}*\n`;
        if (hasConsultar) msg += '_(*Algunos productos requieren confirmación de precio)_\n';
        msg += '\n¡Gracias por su pedido! 🙏';

        return encodeURIComponent(msg);
    }

// ── BOTÓN ENVIAR ─────────────────────────────────────────────────────
    sendBtn.addEventListener('click', () => {
        if (Object.keys(cart).length === 0) {
            alert('Tu carrito está vacío. Agrega productos antes de enviar.');
            return;
        }
        const encoded = buildWhatsAppMessage();
        // Redirige directamente al número 0963664620 en una pestaña nueva
        window.open(`https://wa.me/593963664620?text=${encoded}`, '_blank');
    });

    // ── FILTRADO COMBINADO ───────────────────────────────────────────────
    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        let visibleCount = 0;

        productCards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc  = card.querySelector('p').innerText.toLowerCase();
            const matchesCategory = (activeFilter === 'all') || card.classList.contains(activeFilter);
            const matchesSearch   = title.includes(searchTerm) || desc.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.classList.remove('hide');
                visibleCount++;
            } else {
                card.classList.add('hide');
            }
        });

        noResultsMsg.classList.toggle('hide', visibleCount !== 0);
    }

    searchBar.addEventListener('input', applyFilters);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            productCards.forEach(card => {
                card.style.animation = 'none';
                card.offsetHeight;
                card.style.animation = null;
            });
            applyFilters();
        });
    });

    // ── MODO OSCURO ──────────────────────────────────────────────────────
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });

    // Inicializar
    applyFilters();
    renderCart();
});