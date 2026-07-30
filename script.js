document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. LÓGICA DE INTERFAZ (Filtros, Buscador, Tema Oscuro)
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
    // 2. LÓGICA DEL CARRITO DE COMPRAS
    // ----------------------------------------------------
    let cart = []; // Array donde se guardan los productos

    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Abrir/Cerrar Modal del Carrito
    cartBtn.addEventListener('click', () => cartModal.classList.add('show'));
    closeCart.addEventListener('click', () => cartModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('show');
    });

    // Agregar producto al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));

            // Revisar si ya está en el carrito
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({ name: name, price: price, qty: 1 });
            }

            // Efecto visual en el botón
            const originalText = e.target.innerHTML;
            e.target.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';
            e.target.style.backgroundColor = '#25D366'; // Se pone verde un segundo
            setTimeout(() => {
                e.target.innerHTML = originalText;
                e.target.style.backgroundColor = '';
            }, 1000);

            updateCartUI();
        });
    });

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
                
                // Si el precio es 0, significa "Consultar Precio"
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

        // Asignar eventos a los botones de sumar/restar en el carrito
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.getAttribute('data-index'), -1));
        });
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.getAttribute('data-index'), 1));
        });
    };

    // Función para sumar o restar cantidades
    const updateQuantity = (index, change) => {
        if (cart[index].qty + change > 0) {
            cart[index].qty += change;
        } else {
            cart.splice(index, 1); // Lo elimina si llega a 0
        }
        updateCartUI();
    };

    // ----------------------------------------------------
    // 3. ENVÍO POR WHATSAPP
    // ----------------------------------------------------
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Agrega productos al carrito primero.");
            return;
        }

        // Armar el mensaje
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

        // ----------------------------------------------------
    // 4. LÓGICA DE LA PESTAÑA DE SABORES (MODAL DE VARIANTES)
    // ----------------------------------------------------
    const variantModal = document.getElementById('variant-modal');
    const closeVariant = document.getElementById('close-variant');
    const variantSelect = document.getElementById('variant-select');
    const variantProductName = document.getElementById('variant-product-name');
    const confirmVariantBtn = document.getElementById('confirm-variant-btn');

    let currentVariantProduct = null;

    // Al hacer clic en "Elegir Sabor"
    document.querySelectorAll('.open-variant-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevenir que se agregue directamente al carrito si tenía la clase anterior
            e.preventDefault(); 
            
            const btn = e.currentTarget;
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const options = btn.getAttribute('data-options').split(','); // Separa los sabores por las comas

            currentVariantProduct = { name, price };
            variantProductName.innerText = name;

            // Limpiar y llenar la lista desplegable de sabores
            variantSelect.innerHTML = '';
            options.forEach(opt => {
                variantSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
            });

            variantModal.classList.add('show');
        });
    });

    // Cerrar la pestaña de sabores
    closeVariant.addEventListener('click', () => variantModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === variantModal) variantModal.classList.remove('show');
    });

    // Confirmar y agregar al carrito final
    confirmVariantBtn.addEventListener('click', (e) => {
        if (!currentVariantProduct) return;
        
        const selectedFlavor = variantSelect.value;
        const finalName = `${currentVariantProduct.name} (${selectedFlavor})`;
        const price = parseFloat(currentVariantProduct.price);

        // Lógica para agregarlo al carrito
        const existingItem = cart.find(item => item.name === finalName);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ name: finalName, price: price, qty: 1 });
        }

        // Efecto visual de confirmación en el botón
        const originalText = e.target.innerHTML;
        e.target.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
        e.target.style.backgroundColor = '#25D366'; 
        
        updateCartUI(); // Actualiza el carrito superior

        // Ocultar la ventana después de 1 segundo
        setTimeout(() => {
            e.target.innerHTML = originalText;
            e.target.style.backgroundColor = '';
            variantModal.classList.remove('show');
        }, 800);
    });

        message += `\n*Total Estimado:* $${total.toFixed(2)}`;
        
        // Codificar el texto para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Número de WhatsApp (puedes cambiarlo si deseas que vaya al otro número)
        const whatsappNumber = "593963664620";
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Abrir WhatsApp en una pestaña nueva
        window.open(whatsappURL, '_blank');
    });

    // Iniciar con carrito vacío en pantalla
    updateCartUI();
});
