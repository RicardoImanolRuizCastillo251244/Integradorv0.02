import { BASE_URL } from "./api_url.js";

let quejaActualId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    // Verificar si hay una pestaña activa guardada desde notificaciones
    const quejaTabActiva = localStorage.getItem('quejaTabActiva');
    if (quejaTabActiva === 'QUEJA_USUARIO') {
        // Mantener activa la pestaña de quejas de usuario (ya está activa por defecto)
        localStorage.removeItem('quejaTabActiva');
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
                    <button class="btn-eliminar" onclick="window.eliminarQueja(${idQueja}, '${tipoQueja}')">
                        <i class="fa-solid fa-trash"></i> Eliminar
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

            // Llenar modal con datos básicos
            document.getElementById('detalleIdUsuario').innerText = `#${queja.id_emisor || queja.id_usuario || '0'}`;
            document.getElementById('detalleUsuario').innerText = queja.nombre_usuario || 'Usuario desconocido';

            const fecha = new Date(queja.fecha_emision || queja.fecha_creacion);
            document.getElementById('detalleFecha').innerText = fecha.toLocaleString('es-ES');

            // Mostrar tipo de problema si existe (solo para quejas de venta)
            const tipoProblemaElement = document.getElementById('detalleTipoProblema');
            if (tipoQueja === 'venta' && queja.tipo_problema) {
                tipoProblemaElement.innerText = queja.tipo_problema;
                tipoProblemaElement.style.display = 'block';
                // Cambiar color según tipo
                if (queja.tipo_problema.includes('Efectivo') || queja.tipo_problema.includes('no se presentó')) {
                    tipoProblemaElement.className = 'alert alert-danger';
                } else {
                    tipoProblemaElement.className = 'alert alert-warning';
                }
            } else {
                tipoProblemaElement.style.display = 'none';
            }

            document.getElementById('detalleDescripcion').innerText = queja.descripcion_queja || queja.descripcion || 'Sin descripción';

            // Si es queja de usuario y tiene id_publicacion, cargar info de la publicación
            if (tipoQueja === 'usuario' && queja.id_publicacion) {
                await cargarInfoPublicacion(queja.id_publicacion, queja.id_receptor);
            }

            const modal = new bootstrap.Modal(document.getElementById('modalDetalleQuejaUsuario'));
            modal.show();
        } else {
            alert('Error al cargar detalle de queja.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Función para cargar información de la publicación reportada
async function cargarInfoPublicacion(idPublicacion, idReceptor) {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + `publicacion/${idPublicacion}`, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const publicacion = await response.json();

            // Crear o actualizar sección de información de publicación en el modal
            let seccionPublicacion = document.getElementById('seccion-publicacion-reportada');
            if (!seccionPublicacion) {
                seccionPublicacion = document.createElement('div');
                seccionPublicacion.id = 'seccion-publicacion-reportada';
                seccionPublicacion.className = 'mt-4 p-3 border rounded bg-light';

                const descripcionQueja = document.querySelector('.descripcion-queja');
                if (descripcionQueja) {
                    descripcionQueja.insertAdjacentElement('afterend', seccionPublicacion);
                }
            }

            seccionPublicacion.innerHTML = `
                <h6 class="mb-3" style="color: #c00000; font-weight: bold;">
                    <i class="fas fa-ban"></i> Publicación Reportada
                </h6>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Título:</strong> ${publicacion.titulo || 'Sin título'}</p>
                        <p><strong>Descripción:</strong> ${publicacion.descripcion || 'Sin descripción'}</p>
                        <p><strong>Precio:</strong> $${publicacion.precio || '0'}</p>
                        <p><strong>ID Vendedor:</strong> ${idReceptor || publicacion.id_usuario}</p>
                    </div>
                    <div class="col-md-6">
                        ${publicacion.imagenes && publicacion.imagenes.length > 0 ?
                            `<img src="${publicacion.imagenes[0]}"
                                 class="img-fluid border rounded"
                                 alt="Producto reportado"
                                 style="max-height: 200px; object-fit: cover;">` :
                            '<p class="text-muted">Sin imagen</p>'
                        }
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-danger btn-sm" onclick="banearUsuarioPorPublicacion(${idReceptor || publicacion.id_usuario})">
                        <i class="fas fa-ban"></i> Banear Usuario por Contenido Inapropiado
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar publicación:', error);
    }
}

// Función para banear usuario desde queja de publicación
window.banearUsuarioPorPublicacion = async (idUsuario) => {
    const authToken = localStorage.getItem('authToken');

    const confirmacion = confirm(
        `⚠️ ¿ESTÁS SEGURO DE BANEAR A ESTE USUARIO?\n\n` +
        `ID del usuario: ${idUsuario}\n\n` +
        `Esta acción suspenderá permanentemente al usuario por publicar contenido inapropiado.`
    );

    if (!confirmacion) return;

    const motivo = prompt('Motivo del baneo (obligatorio):');

    if (!motivo || motivo.trim() === '') {
        alert('Debes proporcionar un motivo para el baneo');
        return;
    }

    try {
        const response = await fetch(BASE_URL + 'usuario-baneado', {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: idUsuario,
                motivo: motivo.trim()
            })
        });

        if (response.ok || response.status === 201) {
            alert(`🔨 Usuario bloqueado exitosamente.\n\nMotivo: ${motivo}`);
            bootstrap.Modal.getInstance(document.getElementById('modalDetalleQuejaUsuario')).hide();

            // Marcar la queja como cerrada
            if (quejaActualId && tipoQuejaActual) {
                await cerrarQuejaUsuario();
            }
        } else {
            const errorText = await response.text();
            alert(`Error al banear usuario: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al banear usuario');
    }
};

// Función para cerrar queja de usuario
async function cerrarQuejaUsuario() {
    const authToken = localStorage.getItem('authToken');

    try {
        const getResponse = await fetch(BASE_URL + `queja-usuario/${quejaActualId}`, {
            headers: { 'Authorization': authToken }
        });

        if (getResponse.ok) {
            const quejaData = await getResponse.json();

            const updateData = {
                id_emisor: quejaData.id_emisor,
                id_receptor: quejaData.id_receptor,
                descripcion_queja: quejaData.descripcion_queja,
                estado_queja: 'CERRADA',
                motivo_queja: quejaData.motivo_queja
            };

            if (quejaData.id_publicacion) {
                updateData.id_publicacion = quejaData.id_publicacion;
            }

            await fetch(BASE_URL + `queja-usuario/${quejaActualId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
        }
    } catch (error) {
        console.error('Error al cerrar queja:', error);
    }
}

// Abrir modal de respuesta
window.abrirModalRespuesta = () => {
    // Cerrar modal de detalle
    const modalDetalle = bootstrap.Modal.getInstance(document.getElementById('modalDetalleQuejaUsuario'));
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

// Eliminar queja
window.eliminarQueja = async (idQueja, tipoQueja) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta queja?')) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        const endpoint = tipoQueja === 'usuario' ? 'queja-usuario' : 'queja-venta';
        console.log(`Eliminando queja: ${BASE_URL}${endpoint}/${idQueja}`);
        
        const response = await fetch(BASE_URL + `${endpoint}/${idQueja}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok || response.status === 204) {
            alert('Queja eliminada correctamente.');
            location.reload();
        } else {
            const errorText = await response.text();
            console.error('Error al eliminar:', response.status, errorText);
            alert(`Error al eliminar (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión: ' + error.message);
    }
};
