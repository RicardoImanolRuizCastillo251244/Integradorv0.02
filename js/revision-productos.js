import { BASE_URL } from "./api_url.js";

let productoActualId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Endpoint para obtener todos los productos
        const response = await fetch(BASE_URL + 'productos', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const productos = await response.json();
            renderTabla(productos);
        } else {
            console.error('Error al cargar productos:', response.status);
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar datos.</td></tr>';
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
        const response = await fetch(BASE_URL + `productos/${idProducto}`, {
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
        const response = await fetch(BASE_URL + `productos/${idProducto}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
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
        const response = await fetch(BASE_URL + `productos/${idProducto}`, {
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
