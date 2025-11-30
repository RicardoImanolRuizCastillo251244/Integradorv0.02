
import { BASE_URL } from "./api_url.js";

const token = localStorage.getItem("authToken")
const userID = localStorage.getItem("userId")
const rol = localStorage.getItem("rol");


if ( rol != 2 ){
    const btnPublicarProducto = document.getElementById("buttonPost");
    btnPublicarProducto.hidden = true
}

document.addEventListener('DOMContentLoaded', () => {
    const listaProductos = document.getElementById('lista-productos');
    const searchForm = document.getElementById('searchForm');
    const searchInput = searchForm.querySelector('input[type="search"]');
    const categoryLinks = document.querySelectorAll('.titulo-categoria');
    const btnPublicar = document.querySelector('.btn-publicar');
    const btnUser = document.querySelector('.btn-admin-icon');
    const btnNoti = document.querySelector('.btn-notiifcacion-icon');
   
    let allPublications = [];
    let currentCategory = 'todo';

    // Mostrar loader al inicio
    mostrarLoader();

    // 1. Cargar publicaciones al inicio
    fetchPublications();

    // 2. Event Listeners para navegación
    if (btnPublicar) {
        btnPublicar.addEventListener('click', () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                window.location.href = '/pages/publicacion.html';
            }
            else {
                window.location.href = '/pages/login.html';
            }
        });
    }

    if (btnUser) {
        btnUser.addEventListener('click', () => {
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
            alert("Fucionalidad en desarrollo")
            /*
            const userId = localStorage.getItem('userId');
            if (userId) {
                window.location.href = '/pages/infousuario.html';
            } else {
                window.location.href = '/pages/login.html';
            }
                */
        });
    }

    // 3. Filtro por Categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            categoryLinks.forEach(l => l.classList.remove('active-tab'));
            e.target.classList.add('active-tab');

            currentCategory = e.target.getAttribute('data-categoria');

            filterAndRender();
        });
    });

    // 4. Búsqueda
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterAndRender();
    });

    searchInput.addEventListener('input', () => {
        filterAndRender();
    });

    function mostrarLoader() {
        listaProductos.innerHTML = `
            <div class="col-12 text-center" style="padding: 100px 0;">
                <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-4 text-muted fs-5">Cargando productos...</p>
            </div>
        `;
    }

    async function fetchPublications() {
        try {
            console.log('Iniciando fetch de publicaciones...');
            const response = await fetch(BASE_URL + 'publicacion');
            console.log('Respuesta status:', response.status);

            if (response.ok) {
                allPublications = await response.json();
                console.log('Publicaciones recibidas:', allPublications);
                renderCarrusel(allPublications);
                renderPublications(allPublications);
                
            } else {
                console.error('Error al obtener publicaciones. Status:', response.status);
                mostrarError();
            }
        } catch (error) {
            console.error('Error de red:', error);
            mostrarError();
        }
    }

    function mostrarError() {
        listaProductos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    <i class="fa-solid fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>Error al cargar los productos</h4>
                    <p>Por favor, intenta nuevamente más tarde.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
                </div>
            </div>
        `;
    }

    function filterAndRender() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        

        let filtered = allPublications;

        // Filtrar por categoría
        if (currentCategory !== 'todo') {
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
            let imageSrc = '/images/productos/4-razones-por-las-que-la-comida-mexicana-es-tan-unica.jpg';

            if (pub.foto_publicacion) {
                if (Array.isArray(pub.foto_publicacion)) {
                    const base64String = btoa(String.fromCharCode.apply(null, pub.foto_publicacion));
                    imageSrc = `data:image/jpeg;base64,${base64String}`;
                } else if (typeof pub.foto_publicacion === 'string') {
                    if (pub.foto_publicacion.startsWith('data:image')) {
                        imageSrc = pub.foto_publicacion;
                    } else {
                        imageSrc = `data:image/jpeg;base64,${pub.foto_publicacion}`;
                    }
                }
            }

            const cardCol = document.createElement('div');
            cardCol.className = 'col-12 col-sm-6 col-md-3 mb-4';

            cardCol.innerHTML = `
                <a href="/pages/comprar.html?id=${pub.id_publicacion}" class="text-decoration-none">
        <div class="card-producto h-100">
            <div class="card-img-container">
                <img src="${imageSrc}" class="card-img-producto" alt="${pub.titulo_publicacion}">
                <div class="card-overlay">
                    <span class="ver-mas">Ver detalles</span>
                </div>
            </div>
            <div class="card-body-producto">
                <h5 class="producto-titulo">${pub.titulo_publicacion}</h5>
                <p class="producto-precio">$${parseFloat(pub.precio_producto).toFixed(2)}</p>
            </div>
        </div>
    </a>
            `;

            listaProductos.appendChild(cardCol);
        });
    }

    function renderCarrusel(productos) {
        const contenedor = document.getElementById('carrusel-contenedor')
        if (productos.length < 3) {
            console.log("ESTOY AQUI TRUE")
            productos.forEach(pub=>{
                let imageSrc = '';

                if (pub.foto_publicacion) {
                    if (Array.isArray(pub.foto_publicacion)) {
                        const base64String = btoa(String.fromCharCode.apply(null,pub.foto_publicacion));
                        imageSrc = `data:image/jpeg;base64,${base64String}`;
                    } else if (typeof pub.foto_publicacion === 'string') {
                        if (pub.foto_publicacion.startsWith('data:image')) {
                            imageSrc = pub.foto_publicacion;
                        } else {
                            imageSrc = `data:image/jpeg;base64,${pub.foto_publicacion}`;
                        }
                    }
                }
                
                const carouselItem = document.createElement('div')
                carouselItem.className = 'carousel-item active'
                
                carouselItem.innerHTML = ` 
                <a href="pages/comprar.html?id=${pub.id_publicacion}">
                <img src="${imageSrc}" class="d-block img-carrusel" alt="FOTO DE producto">
                </a>`
                contenedor.appendChild(carouselItem)
            })
        }
        else {
            console.log("ESTOY AQUI")
            for (let i = 0; i < 3; i++) {
                let imageSrc = '';

                if (productos[i].foto_publicacion) {
                    if (Array.isArray(productos[i].foto_publicacion)) {
                        const base64String = btoa(String.fromCharCode.apply(null, productos[i].foto_publicacion));
                        imageSrc = `data:image/jpeg;base64,${base64String}`;
                    } else if (typeof productos[i].foto_publicacion === 'string') {
                        if (productos[i].foto_publicacion.startsWith('data:image')) {
                            imageSrc = productos[i].foto_publicacion;
                        } else {
                            imageSrc = `data:image/jpeg;base64,${productos[i].foto_publicacion}`;
                        }
                    }
                }
                console.log(productos[i])
                const carouselItem = document.createElement('div')
                carouselItem.className = 'carousel-item active'
                carouselItem.innerHTML = `
                <a href="pages/comprar.html?id=${productos[i].id_publicacion}">
                    <img src="${imageSrc}" class="d-block img-carrusel" alt="FOTO DE producto">
                </a>`
                contenedor.appendChild(carouselItem)
            }
        }

    }
});