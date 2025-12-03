import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Obtener todas las publicaciones y filtrar las que están en cuarentena/revisión
        // Asumiendo que el estado puede ser 'EN_REVISION', 'CUARENTENA' o similar
        const response = await fetch(BASE_URL + 'publicacion', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const todasPublicaciones = await response.json();
            // Filtrar publicaciones en cuarentena o pendientes de revisión
            const productos = todasPublicaciones.filter(p => 
                p.estado_publicacion === 'EN_REVISION' || 
                p.estado_publicacion === 'CUARENTENA' ||
                p.estado_publicacion === 'PENDIENTE'
            );
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

            // Datos del producto - adaptado a los campos de Publicacion
            const nombreUsuario = p.nombre_vendedor || 'Vendedor desconocido';
            const correoUsuario = p.correo_vendedor || 'N/A';
            const titulo = p.titulo_publicacion || 'Sin título';
            const queja = p.motivo_revision || 'Sin motivo registrado';
            
            // Procesar imagen de la publicación
            let imageSrc = '/images/productos/default.jpg';
            if (p.foto_publicacion) {
                if (Array.isArray(p.foto_publicacion)) {
                    const base64String = btoa(String.fromCharCode.apply(null, p.foto_publicacion));
                    imageSrc = `data:image/jpeg;base64,${base64String}`;
                } else if (typeof p.foto_publicacion === 'string') {
                    if (p.foto_publicacion.startsWith('data:image')) {
                        imageSrc = p.foto_publicacion;
                    } else {
                        imageSrc = `data:image/jpeg;base64,${p.foto_publicacion}`;
                    }
                }
            }
            
            const imagenes = [imageSrc]; // Array con la imagen de la publicación

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${titulo}</td>
                <td class="text-center">
                    <button class="btn-ver-imagen" onclick="window.verImagenes(${p.id_publicacion}, ${JSON.stringify(imagenes).replace(/"/g, '&quot;')})">
                        <i class="fa-solid fa-image"></i> Ver fotos
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-ver-queja" onclick="window.verQueja('${queja.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-comment"></i> Ver motivo
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-aceptar" onclick="window.accionProducto(${p.id_publicacion}, 'aceptar')">
                        Aceptar
                    </button>
                    <button class="btn-declinar" onclick="window.accionProducto(${p.id_publicacion}, 'declinar')">
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
            // Primero obtener los datos actuales de la publicación
            const getResponse = await fetch(BASE_URL + `publicacion/${idProducto}`, {
                headers: { 'Authorization': authToken }
            });
            
            if (!getResponse.ok) {
                throw new Error('No se pudo obtener los datos de la publicación');
            }
            
            const publicacionData = await getResponse.json();
            
            // Actualizar el estado de la publicación
            const nuevoEstado = accion === 'aceptar' ? 'ACTIVA' : 'RECHAZADA';
            const response = await fetch(BASE_URL + `publicacion/${idProducto}`, {
                method: 'PUT',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...publicacionData,
                    estado_publicacion: nuevoEstado
                })
            });

            if (response.ok) {
                alert(`Producto ${accion === 'aceptar' ? 'aceptado' : 'declinado'} correctamente.`);
                location.reload();
            } else {
                const error = await response.json().catch(() => ({}));
                alert(`Error: ${error.message || 'No se pudo procesar la acción.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    };
});
