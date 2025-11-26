import { BASE_URL } from "./api_url.js";

document.getElementById('main')



document.addEventListener('DOMContentLoaded', () => {
    const listaProductos = document.getElementById('lista-productos');
    const searchForm = document.getElementById('searchForm');
    const searchInput = searchForm.querySelector('input[type="search"]');
    const categoryLinks = document.querySelectorAll('.titulo-categoria');
    const btnPublicar = document.querySelector('.btn-publicar');
    const btnUser = document.querySelector('.btn-admin-icon'); // Icono de usuario (admin-con-ruedas...)
    const btnNoti = document.querySelector('.btn-notiifcacion-icon');

    let allPublications = [];
    let currentCategory = 'todo';

    // 1. Cargar publicaciones al inicio
    fetchPublications();

    // 2. Event Listeners para navegación
    if (btnPublicar) {
        btnPublicar.addEventListener('click', () => {
            const userId = localStorage.getItem('userId');
            if(userId){
                window.location.href = '/pages/publicacion.html';
            }
            else{
                window.location.href = '/pages/login.html';
            }
        });
    }

    if (btnUser) {
        btnUser.addEventListener('click', () => {
            // Verificar si hay usuario logueado para decidir a dónde ir
            const userId = localStorage.getItem('userId');
            if (userId) {
                window.location.href = '/pages/infousuario.html';
            } else {
                window.location.href = '/pages/login.html';
            }
        });
    }

    if (btnNoti) {
        btnNoti.addEventListener('click', () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                window.location.href = '/pages/infousuario.html';
            } else {
                window.location.href = '/pages/login.html';
            }
        });
    }

    // 3. Filtro por Categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Actualizar clase activa
            categoryLinks.forEach(l => l.classList.remove('active-selection'));
            e.target.classList.add('active-selection');

            // Obtener categoría seleccionada
            currentCategory = e.target.getAttribute('data-categoria');

            // Filtrar y renderizar
            filterAndRender();
        });
    });

    // 4. Búsqueda
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterAndRender();
    });

    searchInput.addEventListener('input', () => {
        // Opcional: búsqueda en tiempo real
        filterAndRender();
    });

    async function fetchPublications() {
        try {
            console.log('Iniciando fetch de publicaciones...');
            const response = await fetch(BASE_URL+'publicacion');
            console.log('Respuesta status:', response.status);

            if (response.ok) {
                allPublications = await response.json();
                console.log('Publicaciones recibidas:', allPublications);
                renderPublications(allPublications);
            } else {
                console.error('Error al obtener publicaciones. Status:', response.status);
                listaProductos.innerHTML = '<p class="text-center">No se pudieron cargar los productos.</p>';
            }
        } catch (error) {
            console.error('Error de red:', error);
            listaProductos.innerHTML = '<p class="text-center">Error de conexión con el servidor.</p>';
        }
    }

    function filterAndRender() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        let filtered = allPublications;

        // Filtrar por categoría
        if (currentCategory !== 'todo') {
            // Asumimos que id_categoria es número en la BD y data-categoria es string
            filtered = filtered.filter(p => p.id_categoria == currentCategory);
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.titulo_publicacion.toLowerCase().includes(searchTerm)
            );
        }

        renderPublications(filtered);
    }

    function renderPublications(publications) {
        listaProductos.innerHTML = '';

        if (publications.length === 0) {
            listaProductos.innerHTML = '<p class="text-center mt-4">No se encontraron productos.</p>';
            return;
        }

        publications.forEach(pub => {
            // Construir src de la imagen
            let imageSrc = '/images/productos/4-razones-por-las-que-la-comida-mexicana-es-tan-unica.jpg'; // Default

            if (pub.foto_publicacion) {
                // Verificar si es un array de bytes (común en Java BLOB -> JSON)
                if (Array.isArray(pub.foto_publicacion)) {
                    // Convertir array de bytes a base64
                    const base64String = btoa(String.fromCharCode.apply(null, pub.foto_publicacion));
                    imageSrc = `data:image/jpeg;base64,${base64String}`;
                } else if (typeof pub.foto_publicacion === 'string') {
                    // Si ya es string, verificar si tiene prefijo
                    if (pub.foto_publicacion.startsWith('data:image')) {
                        imageSrc = pub.foto_publicacion;
                    } else {
                        // Asumir que es base64 sin prefijo
                        imageSrc = `data:image/jpeg;base64,${pub.foto_publicacion}`;
                    }
                }
            }

            const cardCol = document.createElement('div');
            cardCol.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4 mx-auto'; // Responsive grid

            cardCol.innerHTML = `
                <a href="/pages/comprar.html?id=${pub.id_publicacion}" class="text-decoration-none text-dark">
                    <div class="card h-100 shadow-sm">
                        <div style="height: 200px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                            <img src="${imageSrc}" class="card-img-top" alt="${pub.titulo_publicacion}" style="object-fit: cover; height: 100%; width: 100%;">
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="producto-catalogo text-truncate" title="${pub.titulo_publicacion}">${pub.titulo_publicacion}</h5>
                            <p class="card-text producto-catalogo-precio mt-auto">$${parseFloat(pub.precio_producto).toFixed(2)}</p>
                        </div>
                    </div>
                </a>
            `;

            listaProductos.appendChild(cardCol);
        });
    }
});
