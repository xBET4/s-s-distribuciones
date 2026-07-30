document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. LÓGICA DE INTERFAZ (Filtros, Buscador, Tema)
    // ----------------------------------------------------
    const searchBar = document.getElementById('searchBar');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    const themeToggle = document.getElementById('theme-toggle');

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

    const filterProducts = (category) => {
        let hasVisibleProducts = false;
        products.forEach(product => {
            if (category === 'all' || product.classList.contains(category)) {
                product.classList.remove('hide');
                hasVisibleProducts = true;
            } else {
                product.classList.add('hide');
            }
        });
        hasVisibleProducts ? noResults.classList.add('hide') : noResults.classList.remove('hide');
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(e.target.getAttribute('data-filter'));
            searchBar.value = '';
        });
    });

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let hasVisibleProducts = false;

        if (searchTerm !== "") {
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        }

        products.forEach(product => {
            const productText = product.textContent.toLowerCase();
            if (productText.includes(searchTerm)) {
                product.classList.remove('hide');
                hasVisibleProducts = true;
            } else {
                product.classList.add('hide');
            }
        });
        hasVisibleProducts ? noResults.classList.add('hide') : noResults.classList.remove('hide');
    });

    // ----------------------------------------------------
    // 2. LÓGICA DEL CARRITO GENERAL
    // ----------------------------------------------------
    let cart = [];

    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Funciones del Carrito (Abrir / Cerrar)
    cartBtn.addEventListener('click', () => cartModal.classList.add('show'));
    closeCart.addEventListener('click', () => cartModal.classList.remove('show'));

    // Actualizar visualmente el carrito
    const updateCartUI = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20px;">Tu carrito está vacío.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.qty;
                totalItems += item.qty;

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('cart-item');
                
                let priceText = item.price > 0 ? `$${(item.price * item.qty).toFixed(2)}` : 'Por cotizar';

                itemDiv.innerHTML = `
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${priceText}</p>
                    </div>
                    <div class="item-controls">
                        <button class="qty-btn minus" data-index="${index}">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
        }

        cartTotalElement.innerText = total.toFixed(2);
        cartCountElement.innerText = totalItems;

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.getAttribute('data-index'), -1));
        });
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.getAttribute('data-index'), 1));
        });
    };

    const updateQuantity = (index, change) => {
        if (cart[index].qty + change > 0) {
            cart[index].qty += change;
        } else {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    // Agregar producto normal
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Asegurarse de que no sea el botón de confirmar la variante
        if (button.id !== 'confirm-variant-btn') {
            button.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-name');
                const price = parseFloat(e.target.getAttribute('data-price'));

                const existingItem = cart.find(item => item.name === name);
                if (existingItem) {
                    existingItem.qty++;
                } else {
                    cart.push({ name: name, price: price, qty: 1 });
                }

                const originalText = e.target.innerHTML;
                e.target.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';
                e.target.style.backgroundColor = '#25D366';
                setTimeout(() => {
                    e.target.innerHTML = originalText;
                    e.target.style.backgroundColor = '';
                }, 1000);

                updateCartUI();
            });
        }
    });

    // ----------------------------------------------------
    // 3. LÓGICA DE LA PESTAÑA DE SABORES (MODAL DE VARIANTES)
    // ----------------------------------------------------
    const variantModal = document.getElementById('variant-modal');
    const closeVariant = document.getElementById('close-variant');
    const variantSelect = document.getElementById('variant-select');
    const variantProductName = document.getElementById('variant-product-name');
    const confirmVariantBtn = document.getElementById('confirm-variant-btn');

    let currentVariantProduct = null;

    // Abrir modal de sabores
    document.querySelectorAll('.open-variant-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const options = btn.getAttribute('data-options').split(',');

            currentVariantProduct = { name, price };
            variantProductName.innerText = name;

            variantSelect.innerHTML = '';
            options.forEach(opt => {
                variantSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
            });

            variantModal.classList.add('show');
        });
    });

    // Cerrar modales clickeando fuera
    closeVariant.addEventListener('click', () => variantModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('show');
        if (e.target === variantModal) variantModal.classList.remove('show');
    });

    // Confirmar sabor y agregar al carrito
    confirmVariantBtn.addEventListener('click', (e) => {
        if (!currentVariantProduct) return;
        
        const selectedFlavor = variantSelect.value;
        const finalName = `${currentVariantProduct.name} (${selectedFlavor})`;
        const price = parseFloat(currentVariantProduct.price);

        const existingItem = cart.find(item => item.name === finalName);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ name: finalName, price: price, qty: 1 });
        }

        const originalText = e.target.innerHTML;
        e.target.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
        e.target.style.backgroundColor = '#25D366'; 
        
        updateCartUI(); 

        setTimeout(() => {
            e.target.innerHTML = originalText;
            e.target.style.backgroundColor = '';
            variantModal.classList.remove('show');
        }, 800);
    });

    // ----------------------------------------------------
    // 4. ENVÍO DEL PEDIDO A WHATSAPP
    // ----------------------------------------------------
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Agrega productos al carrito primero.");
            return;
        }

        let message = "Hola *S&S Distribuciones*, me gustaría hacer el siguiente pedido:\n\n";
        let total = 0;

        cart.forEach(item => {
            message += `▪️ ${item.qty}x ${item.name}`;
            if (item.price > 0) {
                message += ` ($${(item.price * item.qty).toFixed(2)})\n`;
                total += (item.price * item.qty);
            } else {
                message += ` (Precio a consultar)\n`;
            }
        });

        message += `\n*Total Estimado:* $${total.toFixed(2)}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = "593963664620";
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    });

    updateCartUI();
});
