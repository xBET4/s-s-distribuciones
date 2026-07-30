document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar elementos del HTML
    const searchBar = document.getElementById('searchBar');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    const themeToggle = document.getElementById('theme-toggle');

    // 2. Lógica del Modo Oscuro
    // Revisar si el usuario ya tenía el modo oscuro guardado en su navegador
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'dark'); // Guardar preferencia
        } else {
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });

    // 3. Función Principal de Filtrado
    const filterProducts = (category) => {
        let hasVisibleProducts = false;

        products.forEach(product => {
            // Si la categoría es "all" o si la tarjeta tiene la clase de la categoría
            if (category === 'all' || product.classList.contains(category)) {
                product.classList.remove('hide'); // Mostrar
                hasVisibleProducts = true;
            } else {
                product.classList.add('hide'); // Ocultar
            }
        });

        // Mostrar u ocultar el mensaje de "No hay resultados"
        if (hasVisibleProducts) {
            noResults.classList.add('hide');
        } else {
            noResults.classList.remove('hide');
        }
    };

    // 4. Lógica de los Botones de Categorías
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Quitar clase 'active' de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Añadir clase 'active' al botón clicado
            e.target.classList.add('active');
            
            // Obtener el filtro ('cafe', 'snacks', etc.)
            const filterValue = e.target.getAttribute('data-filter');
            
            // Ejecutar la función de filtrado
            filterProducts(filterValue);
            
            // Limpiar la barra de búsqueda al usar botones
            searchBar.value = '';
        });
    });

    // 5. Lógica de la Barra de Búsqueda
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let hasVisibleProducts = false;

        // Si el usuario escribe algo, resetear los botones al botón "Todo"
        if (searchTerm !== "") {
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        }

        products.forEach(product => {
            // Obtener todo el texto dentro de la tarjeta (título, precio, gramos)
            const productText = product.textContent.toLowerCase();

            // Si el texto de la tarjeta incluye lo que se buscó
            if (productText.includes(searchTerm)) {
                product.classList.remove('hide');
                hasVisibleProducts = true;
            } else {
                product.classList.add('hide');
            }
        });

        // Mostrar u ocultar el mensaje de "No hay resultados"
        if (hasVisibleProducts) {
            noResults.classList.add('hide');
        } else {
            noResults.classList.remove('hide');
        }
    });
});
