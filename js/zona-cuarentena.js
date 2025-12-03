import { BASE_URL } from "./api_url.js";

let quejaActualId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const tablaQuejasBody = document.getElementById('tablaQuejasBody');
    const authToken = localStorage.getItem('authToken');

 //   if (!authToken) {
  //      window.location.href = '../pages/login.html';
  //      return;
  //  }

    try {
        // Cargar productos en cuarentena y quejas de venta en paralelo
        const [responsePublicaciones, responseQuejasVenta] = await Promise.all([
            fetch(BASE_URL + 'publicacion', { headers: { 'Authorization': authToken } }),
            fetch(BASE_URL + 'queja-venta', { headers: { 'Authorization': authToken } })
        ]);

        // Procesar productos en cuarentena
        if (responsePublicaciones.ok) {
            const todasPublicaciones = await responsePublicaciones.json();
            // Filtrar publicaciones en cuarentena o pendientes de revisión
            const productos = todasPublicaciones.filter(p => 
                p.estado_publicacion === 'EN_REVISION' || 
                p.estado_publicacion === 'CUARENTENA' ||
                p.estado_publicacion === 'PENDIENTE'
            );
            renderTabla(productos);
        } else {
            console.error('Error al cargar productos:', responsePublicaciones.status);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar datos.</td></tr>';
        }

        // Procesar quejas de venta
        if (responseQuejasVenta.ok) {
            const quejasVenta = await responseQuejasVenta.json();
            console.log('Quejas de venta obtenidas:', quejasVenta);
            renderQuejasPublicacion(quejasVenta);
        } else {
            console.error('Error al cargar quejas de venta:', responseQuejasVenta.status);
            tablaQuejasBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay quejas de publicación.</td></tr>';
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Error de conexión.</td></tr>';
        tablaQuejasBody.innerHTML = '<tr><td colspan="6" class="text-center">Error de conexión.</td></tr>';
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

// Función para renderizar quejas de publicación
function renderQuejasPublicacion(quejas) {
    const tablaQuejasBody = document.getElementById('tablaQuejasBody');
    
    if (!tablaQuejasBody) {
        console.error('No se encontró el elemento tablaQuejasBody en el DOM');
        return;
    }
    
    tablaQuejasBody.innerHTML = '';

    console.log('Renderizando quejas de publicación, cantidad:', quejas.length);

    if (quejas.length === 0) {
        tablaQuejasBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay quejas de publicación registradas.</td></tr>';
        return;
    }

    quejas.forEach(q => {
        const row = document.createElement('tr');

        const nombreUsuario = q.nombre_usuario || 'Usuario desconocido';
        const correoUsuario = q.correo_usuario || 'N/A';
        const tituloPublicacion = q.titulo_publicacion || 'Sin título';
        const imagenes = q.imagenes || [];
        const idQueja = q.id_queja || q.id;

        row.innerHTML = `
            <td>${nombreUsuario}</td>
            <td>${correoUsuario}</td>
            <td>${tituloPublicacion}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-info" onclick="window.verImagenesQueja(${JSON.stringify(imagenes).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-image"></i> Ver fotos
                </button>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-primary" onclick="window.verDetalleQuejaVenta(${idQueja})">
                    <i class="fa-solid fa-comment"></i> Ver queja
                </button>
            </td>
            <td class="text-center">
                <button class="btn-aceptar" onclick="window.accionQuejaVenta(${idQueja}, 'aceptar')">
                    Aceptar
                </button>
                <button class="btn-declinar" onclick="window.accionQuejaVenta(${idQueja}, 'declinar')">
                    Declinar
                </button>
            </td>
        `;
        tablaQuejasBody.appendChild(row);
    });
}

// Ver imágenes de la queja
window.verImagenesQueja = (imagenes) => {
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

// Ver detalle de queja de venta
window.verDetalleQuejaVenta = async (idQueja) => {
    const authToken = localStorage.getItem('authToken');
    quejaActualId = idQueja;

    try {
        const response = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const queja = await response.json();
            
            document.getElementById('quejaUsuario').innerText = queja.nombre_usuario || 'Usuario desconocido';
            document.getElementById('quejaCorreo').innerText = queja.correo_usuario || 'N/A';
            document.getElementById('quejaTitulo').innerText = queja.titulo_publicacion || 'Sin título';
            document.getElementById('quejaTipoProblema').innerText = queja.tipo_problema || 'No especificado';
            document.getElementById('quejaDescripcion').innerText = queja.descripcion || 'Sin descripción';

            const modal = new bootstrap.Modal(document.getElementById('modalDetalleQueja'));
            modal.show();
        } else {
            alert('Error al cargar el detalle de la queja.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Abrir modal para responder queja
window.abrirModalRespuesta = () => {
    const modalDetalle = bootstrap.Modal.getInstance(document.getElementById('modalDetalleQueja'));
    modalDetalle.hide();

    const modalRespuesta = new bootstrap.Modal(document.getElementById('modalResponderQueja'));
    modalRespuesta.show();
};

// Enviar respuesta a queja de venta
window.enviarRespuestaQueja = async () => {
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
        const getResponse = await fetch(BASE_URL + `queja-venta/${quejaActualId}`, {
            headers: { 'Authorization': authToken }
        });
        
        if (!getResponse.ok) {
            throw new Error('No se pudo obtener los datos de la queja');
        }
        
        const quejaData = await getResponse.json();
        
        const updateData = {
            id_emisor: quejaData.id_emisor,
            descripcion_queja: quejaData.descripcion_queja,
            estado_queja: quejaData.estado_queja || 'ABIERTA',
            id_venta: quejaData.id_venta
        };

        if (quejaData.tipo_problema) {
            updateData.tipo_problema = quejaData.tipo_problema;
        }
        
        const response = await fetch(BASE_URL + `queja-venta/${quejaActualId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok || response.status === 204) {
            alert('Respuesta enviada correctamente.');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalResponderQueja'));
            modal.hide();
            
            document.getElementById('respuestaTexto').value = '';
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

// Aceptar o declinar queja de venta
window.accionQuejaVenta = async (idQueja, accion) => {
    if (!confirm(`¿Estás seguro de que deseas ${accion === 'aceptar' ? 'aceptar' : 'declinar'} esta queja?`)) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        const getResponse = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
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
        
        const updateData = {
            id_emisor: quejaData.id_emisor,
            descripcion_queja: quejaData.descripcion_queja,
            estado_queja: quejaData.estado_queja || 'ABIERTA',
            id_venta: quejaData.id_venta
        };

        if (quejaData.tipo_problema) {
            updateData.tipo_problema = quejaData.tipo_problema;
        }

        console.log('Datos a enviar:', updateData);
        
        const response = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        console.log('Respuesta del servidor:', response.status);

        if (response.ok || response.status === 204) {
            alert(`Queja ${accion === 'aceptar' ? 'aceptada' : 'declinada'} correctamente.`);
            location.reload();
        } else {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            alert(`Error (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión: ' + error.message);
    }
};
