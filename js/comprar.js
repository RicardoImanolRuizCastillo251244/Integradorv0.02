import { BASE_URL } from "./api_url.js";

// ============================================
// VARIABLES GLOBALES
// ============================================
let productoActual = null;
let vendedorActual = null;

// ============================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ============================================
const btncomprar = document.getElementById('btn_comprar');
const btnQueja = document.getElementById('btn_queja');
const cantidadSelect = document.getElementById("cantidadSelect");
const cantidadInput = document.getElementById("cantidadInput");




// ============================================
// EVENT LISTENER: BOTÓN QUEJA
// ============================================
btnQueja.addEventListener('click', (e) => {
    e.preventDefault(); 
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        // Guardar ID del producto para la queja
        if (productoActual && productoActual.id) {
            localStorage.setItem('productoQuejaId', productoActual.id);
        }
        window.location.href = '/pages/Queja.html'; 
    } else {
        mostrarAlerta('⚠️ Debes iniciar sesión para reportar', 'warning');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1500);
    }
});

// ============================================
// SINCRONIZACIÓN DE CANTIDAD
// ============================================
// Cuando se selecciona una opción del select
cantidadSelect.addEventListener("change", () => {
    if (cantidadSelect.value !== "") {
        cantidadInput.value = cantidadSelect.value;
        actualizarPrecioTotal();
    }
});

// Cuando se escribe en el input
cantidadInput.addEventListener("input", () => {
    cantidadSelect.value = "";
    actualizarPrecioTotal();
});

// Validar que no sea menor a 1 cuando pierde el foco
cantidadInput.addEventListener("blur", () => {
    if (cantidadInput.value < 1 || cantidadInput.value === '') {
        cantidadInput.value = 1;
        actualizarPrecioTotal();
    }
});

btncomprar.disabled = true;
// ============================================
// CARGAR PRODUCTO AL INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', async function (){
    
    // Obtener contenedor
    const container = document.querySelector('.producto-container');
    const contenidoOriginal = container.innerHTML;
    
    // Mostrar loader
    container.innerHTML = `
        <div class="loader-wrapper">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-4 text-muted fs-5">Cargando producto...</p>
        </div>
    `;
    
    // Obtener ID del producto desde URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString); 
    const idObtenido = urlParams.get('id');

    // Validar que exista ID
    if (!idObtenido) {
        mostrarError('No se especificó un producto válido');
        return;
    }

    // Cargar datos
    try {
        // Fetch del producto
        const response = await fetch(BASE_URL + 'publicacion/' + idObtenido);
        
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }

        productoActual = await response.json();
        
        // Fetch del vendedor
        const responseUser = await fetch(BASE_URL + 'usuario/' + productoActual.id_vendedor);
        vendedorActual = await responseUser.json();
        
        console.log('✅ Producto cargado:', productoActual);
        console.log('✅ Vendedor cargado:', vendedorActual);
        
        // Restaurar contenido original
        container.innerHTML = contenidoOriginal;
        let existencia = ''
        if(productoActual.existencia_publicacion<10){
            existencia = `<strong>${productoActual.existencia_publicacion} unidades</strong>`
        }
        else{
            existencia = '<strong>10+ unidades</strong'
        }
        
        // Renderizar datos
        renderProducto(productoActual);
        renderDetallesVendedor(vendedorActual, existencia);
        
        // Animación de entrada
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);

    } catch (error) {
        console.error('❌ Error al cargar:', error);
        mostrarError(error.message || 'Error al cargar el producto');
    }

    // ============================================
// EVENT LISTENER: BOTÓN COMPRAR
// ============================================
btncomprar.disabled = false;
btncomprar.addEventListener('click', (e) => {
    e.preventDefault(); 
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        // Guardar datos del producto para la página de pago
        const cantidad = cantidadInput.value || 1;
        localStorage.setItem('productoCompra', JSON.stringify({
            producto: productoActual.id_publicacion,
            cantidad: cantidad,
            vendedor: vendedorActual.id_usuario
        }));
        window.location.href = '/pages/pago.html'; 
    } else {
        mostrarAlerta('⚠️ Debes iniciar sesión para comprar', 'warning');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1500);
    }
});

});

// ============================================
// FUNCIÓN: RENDERIZAR PRODUCTO
// ============================================
function renderProducto(producto){
    const descripcion = document.getElementById('card-text');
    const titulo = document.getElementById('card-title');
    const precio = document.getElementById('precio');
    const img = document.getElementById('productoPublicado');

    // Asignar textos
    titulo.textContent = producto.titulo_publicacion || 'Producto sin título';
    descripcion.textContent = producto.descripcion_publicacion || 'Sin descripción disponible';
    
    // Formatear precio
    const precioFormateado = parseFloat(producto.precio_producto).toFixed(2);
    precio.textContent = `$${precioFormateado}`;
    
    // Procesar imagen
    let imageSrc = procesarImagen(producto.foto_publicacion);
    
    img.src = imageSrc;
    img.alt = producto.titulo_publicacion || 'Producto';
    
    // Manejar error de carga de imagen
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/450x450/fc4b08/ffffff?text=Sin+Imagen';
    };
}

// ============================================
// FUNCIÓN: PROCESAR IMAGEN
// ============================================
function procesarImagen(fotoPublicacion) {
    let imageSrc = "";
    
    if (fotoPublicacion) {
        if (Array.isArray(fotoPublicacion)) {
            // Si es un array de bytes
            const base64String = btoa(String.fromCharCode.apply(null, fotoPublicacion));
            imageSrc = `data:image/jpeg;base64,${base64String}`;
        } else if (typeof fotoPublicacion === 'string') {
            // Si ya es string
            if (fotoPublicacion.startsWith('data:image')) {
                imageSrc = fotoPublicacion;
            } else {
                imageSrc = `data:image/jpeg;base64,${fotoPublicacion}`;
            }
        }
    } else {
        // Imagen placeholder
        imageSrc = 'https://via.placeholder.com/450x450/fc4b08/ffffff?text=Sin+Imagen';
    }
    
    return imageSrc;
}

// ============================================
// FUNCIÓN: RENDERIZAR VENDEDOR
// ============================================
function renderDetallesVendedor(vendedor,existencia){
    const infor = document.getElementById('contenedorDetalles');
    
    // Calificación del vendedor (puedes obtenerla de la API o usar valor por defecto)
    const calificacion = vendedor.calificacion || 4.5;
    const estrellasHTML = generarEstrellas(calificacion);

    infor.innerHTML = `
        <h5><i class="fa-solid fa-store"></i> Información del Vendedor</h5>
        <p>
            <i class="fa-solid fa-user"></i> 
            <strong>${vendedor.nombre_usuario || 'Vendedor'}</strong>
        </p>
        <p>
            <i class="fa-solid fa-star"></i> 
            ${estrellasHTML} 
            <span style="color: #666;">(${calificacion.toFixed(1)})</span>
        </p>
        <p>
            <i class="fa-solid fa-clock"></i> 
            Horario: <strong>08:00 - 20:00</strong>
        </p>
        <p>
            <i class="fa-solid fa-box"></i> 
            Disponibles: ${existencia}
        </p>
        <p>
            <i class="fa-solid fa-truck"></i> 
            <strong>Envío disponible</strong>
        </p>
    `;
}

// ============================================
// FUNCIÓN: GENERAR ESTRELLAS
// ============================================
function generarEstrellas(calificacion) {
    const estrellasCompletas = Math.floor(calificacion);
    const tieneMedia = (calificacion % 1) >= 0.5;
    let html = '';
    
    // Estrellas completas
    for (let i = 0; i < estrellasCompletas; i++) {
        html += '<i class="fa-solid fa-star" style="color: #ffc107;"></i>';
    }
    
    // Media estrella
    if (tieneMedia) {
        html += '<i class="fa-solid fa-star-half-stroke" style="color: #ffc107;"></i>';
    }
    
    // Estrellas vacías
    const estrellasVacias = 5 - estrellasCompletas - (tieneMedia ? 1 : 0);
    for (let i = 0; i < estrellasVacias; i++) {
        html += '<i class="fa-regular fa-star" style="color: #ffc107;"></i>';
    }
    
    return html;
}

// ============================================
// FUNCIÓN: ACTUALIZAR PRECIO TOTAL
// ============================================
function actualizarPrecioTotal() {
    if (!productoActual) return;
    
    const cantidad = parseInt(cantidadInput.value) || 1;
    const precioUnitario = parseFloat(productoActual.precio_producto);
    const total = (precioUnitario * cantidad).toFixed(2);
    
    const precioElement = document.getElementById('precio');
    
    if (cantidad > 1) {
        precioElement.innerHTML = `
            $${total}
            <small style="font-size: 0.4em; display: block; opacity: 0.8; margin-top: 8px;">
                ($${precioUnitario.toFixed(2)} c/u × ${cantidad})
            </small>
        `;
    } else {
        precioElement.textContent = `$${total}`;
    }
    return total
}

// ============================================
// FUNCIÓN: MOSTRAR ALERTAS
// ============================================
function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertaDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    alertaDiv.innerHTML = `
        <strong>${mensaje}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertaDiv);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        alertaDiv.classList.remove('show');
        setTimeout(() => alertaDiv.remove(), 200);
    }, 3000);
}

// ============================================
// FUNCIÓN: MOSTRAR ERROR
// ============================================
function mostrarError(mensaje) {
    const container = document.querySelector('.producto-container');
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fa-solid fa-exclamation-triangle fa-4x mb-4" style="color: #fc4b08;"></i>
            <h4 class="mb-3">Error al cargar el producto</h4>
            <p class="text-muted mb-4">${mensaje}</p>
            <button class="btn btn-comprar" onclick="location.reload()" style="display: inline-flex; width: auto;">
                <i class="fa-solid fa-rotate-right"></i> Reintentar
            </button>
            <a href="../index.html" class="btn btn-queja ms-2" style="display: inline-flex; width: auto;">
                <i class="fa-solid fa-home"></i> Volver al inicio
            </a>
        </div>
    `;
}