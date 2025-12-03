import { BASE_URL } from "./api_url.js";

let quejaActualId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tablaQuejasBody = document.getElementById('tablaQuejasBody');
    const authToken = localStorage.getItem('authToken');

 //   if (!authToken) {
  //      window.location.href = '../pages/login.html';
  //      return;
  //  }

    try {
        // Cargar solo quejas de venta
        const responseQuejasVenta = await fetch(BASE_URL + 'queja-venta', { 
            headers: { 'Authorization': authToken } 
        });

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
        tablaQuejasBody.innerHTML = '<tr><td colspan="6" class="text-center">Error de conexión.</td></tr>';
    }
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
                <button class="btn-descartar" onclick="window.descartarQuejaVenta(${idQueja})">
                    <i class="fa-solid fa-times"></i> Descartar
                </button>
                <button class="btn-eliminar" onclick="window.eliminarPublicacionYQueja(${idQueja})">
                    <i class="fa-solid fa-trash"></i> Eliminar publicación
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

// Eliminar publicación y queja (con notificaciones)
window.eliminarPublicacionYQueja = async (idQueja) => {
    if (!confirm('¿Estás seguro de que deseas eliminar la publicación? Se notificará al vendedor y al comprador.')) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        // 1. Obtener datos de la queja para saber qué publicación eliminar
        console.log(`Obteniendo datos de queja: ${BASE_URL}queja-venta/${idQueja}`);
        const quejaResponse = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
            headers: { 'Authorization': authToken }
        });

        if (!quejaResponse.ok) {
            const errorText = await quejaResponse.text();
            alert('Error al obtener información de la queja: ' + errorText);
            console.error('Error quejaResponse:', errorText);
            return;
        }

        const quejaData = await quejaResponse.json();
        console.log('Datos de la queja:', quejaData);

        // Validar que tenga id_venta
        if (!quejaData.id_venta) {
            alert('Error: La queja no tiene una venta asociada.');
            return;
        }

        const idVenta = quejaData.id_venta;
        
        // 2. Obtener datos de la venta para saber el id_publicacion
        console.log(`Obteniendo datos de venta: ${BASE_URL}venta/${idVenta}`);
        const ventaResponse = await fetch(BASE_URL + `venta/${idVenta}`, {
            headers: { 'Authorization': authToken }
        });

        if (!ventaResponse.ok) {
            const errorText = await ventaResponse.text();
            alert('Error al obtener información de la venta: ' + errorText);
            console.error('Error ventaResponse:', errorText);
            return;
        }

        const ventaData = await ventaResponse.json();
        console.log('Datos de la venta:', ventaData);
        
        // Validar campos de la venta
        if (!ventaData.id_publicacion || !ventaData.id_comprador) {
            alert('Error: Datos incompletos en la venta.');
            return;
        }
        
        const idPublicacion = ventaData.id_publicacion;
        const idComprador = ventaData.id_comprador;

        // 3. Obtener datos de la publicación para saber el id_vendedor
        console.log(`Obteniendo datos de publicación: ${BASE_URL}publicacion/${idPublicacion}`);
        const publicacionResponse = await fetch(BASE_URL + `publicacion/${idPublicacion}`, {
            headers: { 'Authorization': authToken }
        });

        if (!publicacionResponse.ok) {
            const errorText = await publicacionResponse.text();
            alert('Error al obtener información de la publicación: ' + errorText);
            console.error('Error publicacionResponse:', errorText);
            return;
        }

        const publicacionData = await publicacionResponse.json();
        console.log('Datos de la publicación:', publicacionData);
        
        // Validar que tenga id_vendedor
        if (!publicacionData.id_vendedor) {
            alert('Error: La publicación no tiene vendedor asociado.');
            return;
        }
        
        const idVendedor = publicacionData.id_vendedor;

        console.log('ID Publicación:', idPublicacion, 'Vendedor:', idVendedor, 'Comprador:', idComprador);

        // 4. Eliminar la publicación
        console.log(`Eliminando publicación: ${BASE_URL}publicacion/${idPublicacion}`);
        const deletePublicacionResponse = await fetch(BASE_URL + `publicacion/${idPublicacion}`, {
            method: 'DELETE',
            headers: { 'Authorization': authToken }
        });

        if (!deletePublicacionResponse.ok) {
            const errorText = await deletePublicacionResponse.text();
            alert('Error al eliminar la publicación: ' + errorText);
            console.error('Error deletePublicacionResponse:', errorText);
            return;
        }

        console.log('Publicación eliminada exitosamente');

        // 5. Crear notificaciones para vendedor y comprador
        const mensajeVendedor = 'Una de tus publicaciones ha sido eliminada por el administrador debido a una queja.';
        const mensajeComprador = 'Una publicación relacionada con tu compra ha sido eliminada por el administrador.';
        
        // Notificación para el vendedor
        console.log('Enviando notificación al vendedor:', idVendedor);
        const notifVendedorResponse = await fetch(BASE_URL + 'notificacion', {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: idVendedor,
                mensaje: mensajeVendedor,
                tipo: 'SISTEMA',
                leida: false
            })
        });

        if (!notifVendedorResponse.ok) {
            console.warn('No se pudo enviar notificación al vendedor');
        } else {
            console.log('Notificación enviada al vendedor');
        }

        // Notificación para el comprador
        console.log('Enviando notificación al comprador:', idComprador);
        const notifCompradorResponse = await fetch(BASE_URL + 'notificacion', {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: idComprador,
                mensaje: mensajeComprador,
                tipo: 'SISTEMA',
                leida: false
            })
        });

        if (!notifCompradorResponse.ok) {
            console.warn('No se pudo enviar notificación al comprador');
        } else {
            console.log('Notificación enviada al comprador');
        }

        // 6. Eliminar la queja
        console.log(`Eliminando queja: ${BASE_URL}queja-venta/${idQueja}`);
        const deleteQuejaResponse = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
            method: 'DELETE',
            headers: { 'Authorization': authToken }
        });

        if (!deleteQuejaResponse.ok) {
            console.warn('No se pudo eliminar la queja, pero la publicación ya fue eliminada');
        } else {
            console.log('Queja eliminada exitosamente');
        }

        alert('Publicación eliminada correctamente. Se han enviado notificaciones a los usuarios.');
        location.reload();

    } catch (error) {
        console.error('Error completo:', error);
        alert('Error de conexión: ' + error.message);
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

// Descartar queja de venta (solo elimina la queja)
window.descartarQuejaVenta = async (idQueja) => {
    if (!confirm('¿Estás seguro de que deseas descartar esta queja?')) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        console.log(`Descartando queja: ${BASE_URL}queja-venta/${idQueja}`);
        
        const response = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });

        console.log('Respuesta del servidor:', response.status);

        if (response.ok || response.status === 204) {
            alert('Queja descartada correctamente.');
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
