import { BASE_URL } from "./api_url.js";

let quejaActualId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Endpoint para obtener quejas
        const response = await fetch(BASE_URL + 'quejas', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const quejas = await response.json();
            renderTabla(quejas);
        } else {
            console.error('Error al cargar quejas:', response.status);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar datos.</td></tr>';
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Error de conexión.</td></tr>';
    }

    function renderTabla(quejas) {
        tablaBody.innerHTML = '';

        if (quejas.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay quejas registradas.</td></tr>';
            return;
        }

        quejas.forEach(q => {
            const row = document.createElement('tr');

            const nombreUsuario = q.nombre_usuario || 'Usuario desconocido';
            const correoUsuario = q.correo_usuario || 'N/A';
            const tituloPublicacion = q.titulo_publicacion || 'Sin título';
            const imagenes = q.imagenes || [];

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${tituloPublicacion}</td>
                <td class="text-center">
                    <button class="btn-ver-fotos" onclick="window.verImagenes(${JSON.stringify(imagenes).replace(/"/g, '&quot;')})">
                        <i class="fa-solid fa-image"></i> Ver fotos
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-ver-queja" onclick="window.verDetalleQueja(${q.id_queja})">
                        <i class="fa-solid fa-comment"></i> Ver queja
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-aceptar" onclick="window.accionQueja(${q.id_queja}, 'aceptar')">
                        Aceptar
                    </button>
                    <button class="btn-declinar" onclick="window.accionQueja(${q.id_queja}, 'declinar')">
                        Declinar
                    </button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    }
});

// Ver imágenes en modal
window.verImagenes = (imagenes) => {
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

    const modal = new bootstrap.Modal(document.getElementById('modalImagenes'));
    modal.show();
};

// Ver detalle de queja
window.verDetalleQueja = async (idQueja) => {
    const authToken = localStorage.getItem('authToken');
    quejaActualId = idQueja;

    try {
        const response = await fetch(BASE_URL + `quejas/${idQueja}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const queja = await response.json();
            
            // Llenar modal con datos
            document.getElementById('detalleIdUsuario').innerText = `#${queja.id_usuario}`;
            document.getElementById('detalleUsuario').innerText = queja.nombre_usuario || 'Usuario desconocido';
            
            const fecha = new Date(queja.fecha_creacion);
            document.getElementById('detalleFecha').innerText = fecha.toLocaleString('es-ES');
            
            document.getElementById('detalleDescripcion').innerText = queja.descripcion || 'Sin descripción';

            const modal = new bootstrap.Modal(document.getElementById('modalDetalleQueja'));
            modal.show();
        } else {
            alert('Error al cargar detalle de queja.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Abrir modal de respuesta
window.abrirModalRespuesta = () => {
    // Cerrar modal de detalle
    const modalDetalle = bootstrap.Modal.getInstance(document.getElementById('modalDetalleQueja'));
    modalDetalle.hide();

    // Abrir modal de respuesta
    const modalRespuesta = new bootstrap.Modal(document.getElementById('modalResponderQueja'));
    modalRespuesta.show();
};

// Enviar respuesta
window.enviarRespuesta = async () => {
    const respuesta = document.getElementById('respuestaTexto').value.trim();
    const authToken = localStorage.getItem('authToken');

    if (!respuesta) {
        alert('Por favor escribe una respuesta.');
        return;
    }

    if (!quejaActualId) {
        alert('Error: No se ha seleccionado una queja.');
        return;
    }

    try {
        const response = await fetch(BASE_URL + `quejas/${quejaActualId}/responder`, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ respuesta: respuesta })
        });

        if (response.ok) {
            alert('Respuesta enviada correctamente.');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalResponderQueja'));
            modal.hide();
            
            // Limpiar textarea
            document.getElementById('respuestaTexto').value = '';
            
            // Recargar página
            location.reload();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'No se pudo enviar la respuesta.'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Aceptar o declinar queja
window.accionQueja = async (idQueja, accion) => {
    if (!confirm(`¿Estás seguro de que deseas ${accion === 'aceptar' ? 'aceptar' : 'declinar'} esta queja?`)) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        const endpoint = accion === 'aceptar' 
            ? `quejas/${idQueja}/aceptar` 
            : `quejas/${idQueja}/declinar`;

        const response = await fetch(BASE_URL + endpoint, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert(`Queja ${accion === 'aceptar' ? 'aceptada' : 'declinada'} correctamente.`);
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
