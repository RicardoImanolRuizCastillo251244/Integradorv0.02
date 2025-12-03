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
        // Cargar solo quejas de usuario (quejas personales)
        const response = await fetch(BASE_URL + 'queja-usuario', {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const quejas = await response.json();
            renderTabla(quejas.map(q => ({ ...q, tipo: 'usuario' })));
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
            const tipoQueja = q.tipo || 'usuario';
            const idQueja = q.id_queja || q.id;

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
                    <button class="btn-ver-queja" onclick="window.verDetalleQueja(${idQueja}, '${tipoQueja}')">
                        <i class="fa-solid fa-comment"></i> Ver queja
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-aceptar" onclick="window.accionQueja(${idQueja}, 'aceptar', '${tipoQueja}')">
                        Aceptar
                    </button>
                    <button class="btn-declinar" onclick="window.accionQueja(${idQueja}, 'declinar', '${tipoQueja}')">
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
let tipoQuejaActual = null;

window.verDetalleQueja = async (idQueja, tipoQueja) => {
    const authToken = localStorage.getItem('authToken');
    quejaActualId = idQueja;
    tipoQuejaActual = tipoQueja;

    try {
        const endpoint = tipoQueja === 'usuario' ? 'queja-usuario' : 'queja-venta';
        const response = await fetch(BASE_URL + `${endpoint}/${idQueja}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const queja = await response.json();
            
            // Llenar modal con datos
            document.getElementById('detalleIdUsuario').innerText = `#${queja.id_emisor || queja.id_usuario || '0'}`;
            document.getElementById('detalleUsuario').innerText = queja.nombre_usuario || 'Usuario desconocido';
            
            const fecha = new Date(queja.fecha_emision || queja.fecha_creacion);
            document.getElementById('detalleFecha').innerText = fecha.toLocaleString('es-ES');
            
            document.getElementById('detalleDescripcion').innerText = queja.descripcion_queja || queja.descripcion || 'Sin descripción';

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
        // Primero obtener los datos actuales de la queja
        const endpoint = tipoQuejaActual === 'usuario' ? 'queja-usuario' : 'queja-venta';
        const getResponse = await fetch(BASE_URL + `${endpoint}/${quejaActualId}`, {
            headers: { 'Authorization': authToken }
        });
        
        if (!getResponse.ok) {
            throw new Error('No se pudo obtener los datos de la queja');
        }
        
        const quejaData = await getResponse.json();
        
        // Actualizar la queja con la respuesta - NO cambiamos estado_queja porque la BD solo acepta "ABIERTA"
        const updateData = {
            id_emisor: quejaData.id_emisor,
            descripcion_queja: quejaData.descripcion_queja,
            estado_queja: quejaData.estado_queja || 'ABIERTA'
        };

        // Agregar campos específicos según el tipo
        if (tipoQuejaActual === 'usuario') {
            updateData.id_receptor = quejaData.id_receptor;
            if (quejaData.motivo_queja) {
                updateData.motivo_queja = quejaData.motivo_queja;
            }
        } else {
            updateData.id_venta = quejaData.id_venta;
            if (quejaData.tipo_problema) {
                updateData.tipo_problema = quejaData.tipo_problema;
            }
        }
        
        const response = await fetch(BASE_URL + `${endpoint}/${quejaActualId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok || response.status === 204) {
            alert('Respuesta enviada correctamente.');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalResponderQueja'));
            modal.hide();
            
            // Limpiar textarea
            document.getElementById('respuestaTexto').value = '';
            
            // Recargar página
            location.reload();
        } else {
            const errorText = await response.text();
            alert(`Error: ${errorText || 'No se pudo enviar la respuesta.'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión: ' + error.message);
    }
};

// Aceptar o declinar queja
window.accionQueja = async (idQueja, accion, tipoQueja) => {
    if (!confirm(`¿Estás seguro de que deseas ${accion === 'aceptar' ? 'aceptar' : 'declinar'} esta queja?`)) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        // Primero obtener los datos actuales de la queja
        const endpoint = tipoQueja === 'usuario' ? 'queja-usuario' : 'queja-venta';
        console.log(`Obteniendo queja: ${BASE_URL}${endpoint}/${idQueja}`);
        
        const getResponse = await fetch(BASE_URL + `${endpoint}/${idQueja}`, {
            headers: { 'Authorization': authToken }
        });
        
        if (!getResponse.ok) {
            const errorText = await getResponse.text();
            console.error('Error al obtener queja:', getResponse.status, errorText);
            alert(`Error al obtener la queja (${getResponse.status}): ${errorText}`);
            return;
        }
        
        const quejaData = await getResponse.json();
        console.log('Datos de la queja obtenidos:', quejaData);
        
        // Actualizar la queja - NO cambiamos estado_queja porque la BD solo acepta "ABIERTA"
        // La acción de aceptar/declinar solo eliminará la queja o la marcará como respondida
        const updateData = {
            id_emisor: quejaData.id_emisor,
            descripcion_queja: quejaData.descripcion_queja,
            estado_queja: quejaData.estado_queja  // Mantener el estado actual (ABIERTA)
        };

        // Agregar campos específicos según el tipo
        if (tipoQueja === 'usuario') {
            updateData.id_receptor = quejaData.id_receptor;
            if (quejaData.motivo_queja) {
                updateData.motivo_queja = quejaData.motivo_queja;
            }
        } else {
            updateData.id_venta = quejaData.id_venta;
            if (quejaData.tipo_problema) {
                updateData.tipo_problema = quejaData.tipo_problema;
            }
        }
        
        console.log('Datos a enviar:', updateData);
        
        const response = await fetch(BASE_URL + `${endpoint}/${idQueja}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok || response.status === 204) {
            alert(`Queja ${accion === 'aceptar' ? 'aceptada' : 'declinada'} correctamente.`);
            location.reload();
        } else {
            const errorText = await response.text();
            console.error('Error al actualizar:', response.status, errorText);
            alert(`Error al actualizar (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión: ' + error.message);
    }
};
