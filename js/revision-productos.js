import { BASE_URL } from "./api_url.js";

let productoActualId = null;
let quejaActualId = null;
let tipoQuejaActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Cargar productos y quejas de venta (quejas de publicación)
        const [responseProductos, responseQuejasVenta] = await Promise.all([
            fetch(BASE_URL + 'publicacion', { headers: { 'Authorization': authToken } }),
            fetch(BASE_URL + 'queja-venta', { headers: { 'Authorization': authToken } })
        ]);

        if (responseProductos.ok) {
            const productos = await responseProductos.json();
            renderTabla(productos);
        } else {
            console.error('Error al cargar productos:', responseProductos.status);
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar datos.</td></tr>';
        }
        
        // Cargar quejas de publicación en la sección correspondiente
        if (responseQuejasVenta.ok) {
            const quejasVenta = await responseQuejasVenta.json();
            console.log('Quejas de venta obtenidas:', quejasVenta);
            renderQuejasPublicacion(quejasVenta);
        } else {
            console.error('Error al cargar quejas de venta:', responseQuejasVenta.status);
            const tablaQuejasBody = document.getElementById('tablaQuejasBody');
            if (tablaQuejasBody) {
                tablaQuejasBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay quejas de publicación.</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error de conexión.</td></tr>';
    }

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
                    <button class="btn btn-sm btn-info" onclick="window.verImagenes(${JSON.stringify(imagenes).replace(/"/g, '&quot;')})">
                        <i class="fa-solid fa-image"></i> Ver fotos
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary" onclick="window.verDetalleQuejaVenta(${idQueja})">
                        <i class="fa-solid fa-comment"></i> Ver queja
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-success" onclick="window.accionQuejaVenta(${idQueja}, 'aceptar')">
                        Aceptar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.accionQuejaVenta(${idQueja}, 'declinar')">
                        Declinar
                    </button>
                </td>
            `;
            tablaQuejasBody.appendChild(row);
        });
    }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error de conexión.</td></tr>';
    }

    function renderTabla(productos) {
        tablaBody.innerHTML = '';

        if (productos.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay productos registrados.</td></tr>';
            return;
        }

        productos.forEach(p => {
            const row = document.createElement('tr');

            const nombreVendedor = p.nombre_vendedor || p.vendedor || 'Vendedor desconocido';
            const titulo = p.titulo || p.nombre || 'Sin título';
            const precio = p.precio ? `$${parseFloat(p.precio).toFixed(2)}` : 'N/A';
            const imagenes = p.imagenes || p.fotos || [];
            const estado = p.estado || 'activo';
            const idProducto = p.id_producto || p.id;

            // Clase de estado
            let estadoClass = 'estado-activo';
            let estadoTexto = 'Activo';
            
            if (estado === 'inactivo' || estado === 'INACTIVO' || estado === 'suspendido') {
                estadoClass = 'estado-inactivo';
                estadoTexto = 'Inactivo';
            } else if (estado === 'cuarentena' || estado === 'pendiente') {
                estadoClass = 'estado-pendiente';
                estadoTexto = 'Pendiente';
            }

            row.innerHTML = `
                <td>#${idProducto}</td>
                <td>${nombreVendedor}</td>
                <td>${titulo}</td>
                <td>${precio}</td>
                <td class="text-center">
                    <button class="btn-ver-fotos" onclick="window.verImagenes(${JSON.stringify(imagenes).replace(/"/g, '&quot;')})">
                        <i class="fa-solid fa-image"></i> Ver fotos
                    </button>
                </td>
                <td class="text-center">
                    <span class="${estadoClass}">${estadoTexto}</span>
                </td>
                <td class="text-center">
                    <button class="btn-ver-detalle" onclick="window.verDetalle(${idProducto})">
                        <i class="fa-solid fa-eye"></i> Ver
                    </button>
                    ${estado === 'activo' ? 
                        `<button class="btn-suspender" onclick="window.cambiarEstadoProducto(${idProducto}, 'suspender')">
                            Suspender
                        </button>` : 
                        `<button class="btn-activar" onclick="window.cambiarEstadoProducto(${idProducto}, 'activar')">
                            Activar
                        </button>`
                    }
                    <button class="btn-eliminar" onclick="window.eliminarProducto(${idProducto})">
                        Eliminar
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

// Ver detalle del producto
window.verDetalle = async (idProducto) => {
    const authToken = localStorage.getItem('authToken');
    productoActualId = idProducto;

    try {
        const response = await fetch(BASE_URL + `publicacion/${idProducto}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const producto = await response.json();
            
            document.getElementById('detalleTitulo').innerText = producto.titulo || producto.nombre || 'Sin título';
            document.getElementById('detallePrecio').innerText = producto.precio ? `$${parseFloat(producto.precio).toFixed(2)}` : 'N/A';
            document.getElementById('detalleVendedor').innerText = producto.nombre_vendedor || producto.vendedor || 'Desconocido';
            document.getElementById('detalleCategoria').innerText = producto.categoria || producto.nombre_categoria || 'Sin categoría';
            document.getElementById('detalleDescripcion').innerText = producto.descripcion || 'Sin descripción';

            const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
            modal.show();
        } else {
            alert('Error al cargar detalle del producto.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Cambiar estado del producto (suspender/activar)
window.cambiarEstadoProducto = async (idProducto, accion) => {
    const authToken = localStorage.getItem('authToken');
    const nuevoEstado = accion === 'suspender' ? 'inactivo' : 'activo';

    if (!confirm(`¿Estás seguro de que deseas ${accion} este producto?`)) {
        return;
    }

    try {
        const response = await fetch(BASE_URL + `publicacion/${idProducto}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'text/plain'
            },
            body: nuevoEstado
        });

        if (response.ok) {
            alert(`Producto ${accion === 'suspender' ? 'suspendido' : 'activado'} correctamente.`);
            location.reload();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'No se pudo cambiar el estado.'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Eliminar producto
window.eliminarProducto = async (idProducto) => {
    const authToken = localStorage.getItem('authToken');

    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const response = await fetch(BASE_URL + `publicacion/${idProducto}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            alert('Producto eliminado correctamente.');
            location.reload();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'No se pudo eliminar el producto.'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

// Ver detalle de queja de venta
window.verDetalleQuejaVenta = async (idQueja) => {
    const authToken = localStorage.getItem('authToken');
    quejaActualId = idQueja;
    tipoQuejaActual = 'venta';

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
