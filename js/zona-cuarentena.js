import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Endpoint para obtener productos en cuarentena
        const response = await fetch(BASE_URL + 'productos/cuarentena', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const productos = await response.json();
            renderTabla(productos);
        } else {
            console.error('Error al cargar productos:', response.status);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar datos.</td></tr>';
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Error de conexión.</td></tr>';
    }

    function renderTabla(productos) {
        tablaBody.innerHTML = '';

        if (productos.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos en cuarentena.</td></tr>';
            return;
        }

        productos.forEach(p => {
            const row = document.createElement('tr');

            // Datos del producto
            const nombreUsuario = p.nombre_usuario || 'Usuario desconocido';
            const correoUsuario = p.correo_usuario || 'N/A';
            const titulo = p.titulo || 'Sin título';
            const queja = p.queja || 'Sin queja registrada';
            const imagenes = p.imagenes || []; // Array de URLs de imágenes

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${titulo}</td>
                <td class="text-center">
                    <button class="btn-ver-imagen" onclick="window.verImagenes(${p.id_producto}, ${JSON.stringify(imagenes).replace(/"/g, '&quot;')})">
                        <i class="fa-solid fa-image"></i> Ver fotos
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-ver-queja" onclick="window.verQueja('${queja.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-comment"></i> Ver queja
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-aceptar" onclick="window.accionProducto(${p.id_producto}, 'aceptar')">
                        Aceptar
                    </button>
                    <button class="btn-declinar" onclick="window.accionProducto(${p.id_producto}, 'declinar')">
                        Declinar
                    </button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    }

    // Función para ver imágenes en modal
    window.verImagenes = (idProducto, imagenes) => {
        const carouselInner = document.getElementById('imagenesCarousel');
        carouselInner.innerHTML = '';

        if (imagenes.length === 0) {
            carouselInner.innerHTML = '<div class="carousel-item active"><p class="text-center">No hay imágenes disponibles</p></div>';
        } else {
            imagenes.forEach((img, index) => {
                const item = document.createElement('div');
                item.className = index === 0 ? 'carousel-item active' : 'carousel-item';
                item.innerHTML = `<img src="${img}" class="d-block w-100" alt="Imagen ${index + 1}" style="max-height: 500px; object-fit: contain;">`;
                carouselInner.appendChild(item);
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('modalImagen'));
        modal.show();
    };

    // Función para ver queja en modal
    window.verQueja = (queja) => {
        document.getElementById('quejaTexto').innerText = queja;
        const modal = new bootstrap.Modal(document.getElementById('modalQueja'));
        modal.show();
    };

    // Función para aceptar o declinar producto
    window.accionProducto = async (idProducto, accion) => {
        if (!confirm(`¿Estás seguro de que deseas ${accion === 'aceptar' ? 'aceptar' : 'declinar'} este producto?`)) {
            return;
        }

        try {
            const endpoint = accion === 'aceptar' 
                ? `productos/cuarentena/${idProducto}/aceptar` 
                : `productos/cuarentena/${idProducto}/rechazar`;

            const response = await fetch(BASE_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert(`Producto ${accion === 'aceptar' ? 'aceptado' : 'declinado'} correctamente.`);
                location.reload();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'No se pudo procesar la acción.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    };
});
