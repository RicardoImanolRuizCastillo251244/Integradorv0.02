import { BASE_URL } from "./api_url.js";
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("authToken");
let productoActual = null;
let vendedorActual = null;
let calificacion = null;
let listaHorarios = null
document.addEventListener('DOMContentLoaded', async function () {


    const container = document.querySelector('.producto-container');
    const contenidoOriginal = container.innerHTML;


    container.innerHTML = `
        <div class="loader-wrapper">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-4 text-muted fs-5">Cargando producto...</p>
        </div>
    `;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idObtenido = urlParams.get('id');


    if (!idObtenido) {
        mostrarError('No se especificó un producto válido');
        return;
    }

    try {
        const response = await fetch(BASE_URL + 'publicacion/' + idObtenido);

        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }

        productoActual = await response.json();

        const responseUser = await fetch(BASE_URL + 'usuario/' + productoActual.id_vendedor);
        vendedorActual = await responseUser.json();

<<<<<<< HEAD
        const responseCalificacion = await fetch(BASE_URL + 'calificacion/promedio/' + productoActual.id_publicacion);

        if (!responseCalificacion.ok) {
            const errorCalificacion = await responseCalificacion.text()
            console.error(errorCalificacion)

        }

        calificacion = await responseCalificacion.json()

        const horarios = await fetch(`${BASE_URL}horaEntrega/${productoActual.id_vendedor}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        listaHorarios = await horarios.json()
        
        console.log(listaHorarios)
=======
        const responseCalificacion = await fetch(BASE_URL+'calificacion/promedio/'+productoActual.id_publicacion);

        calificacion = await responseCalificacion.json()
>>>>>>> 360cc9d684137b5388400e5fd6af31bc3cccabe7

        console.log('✅ Producto cargado:', productoActual);
        console.log('✅ Vendedor cargado:', vendedorActual);
        console.log("Calificacion cargada:", calificacion)

        container.innerHTML = contenidoOriginal;
        let existencia = ''
        if (productoActual.existencia_publicacion < 10) {
            existencia = `<strong>${productoActual.existencia_publicacion} unidades</strong>`
        }
        else {
            existencia = '<strong>10+ unidades</strong'
        }


        renderProducto(productoActual);
        renderDetallesVendedor(vendedorActual, existencia, calificacion);
        renderHorarios()

        const btncomprar = document.getElementById('btn_comprar');
        const btnQueja = document.getElementById('btn_queja');
        const cantidadSelect = document.getElementById("cantidadSelect");
        const cantidadInput = document.getElementById("cantidadInput");
        const selectHorario = document.getElementById('select_horario')

        btncomprar.addEventListener('click', () => {
            const userId = localStorage.getItem('userId');

            if (userId) {
                // Guardar datos del producto para la página de pago
                const cantidad = cantidadInput.value || 1;
                const horario = selectHorario.value
                localStorage.setItem('productoCompra', JSON.stringify({
                    productoId: productoActual.id_publicacion,
                    cantidad: cantidad,
                    vendedorId: vendedorActual.id_usuario,
                    totalVenta: actualizarPrecioTotal(),
                    hora: horario
                }));
                window.location.href = '/pages/pago.html'; 
            } else {
                mostrarAlerta('Debes iniciar sesión para comprar', 'warning');
                setTimeout(() => {
                    window.location.href = '/pages/login.html';
                }, 1500);
            }
        });

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
                mostrarAlerta('Debes iniciar sesión para reportar', 'warning');
                setTimeout(() => {
                    window.location.href = '/pages/login.html';
                }, 1500);
            }
        });

        cantidadSelect.addEventListener("change", () => {
            if (cantidadSelect.value !== "") {
                cantidadInput.value = cantidadSelect.value;
                actualizarPrecioTotal();
            }
        });


        cantidadInput.addEventListener("input", () => {
            cantidadSelect.value = "";
            actualizarPrecioTotal();
        });


        cantidadInput.addEventListener("blur", () => {
            if (cantidadInput.value < 1 || cantidadInput.value === '') {
                cantidadInput.value = 1;
                actualizarPrecioTotal();
            }
        });


<<<<<<< HEAD
=======
cantidadInput.addEventListener("blur", () => {
    if (cantidadInput.value < 1 || cantidadInput.value === '') {
        cantidadInput.value = 1;
        actualizarPrecioTotal();
    }
});

    btncomprar.addEventListener('click', () => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        // Guardar datos del producto para la página de pago
        const cantidad = cantidadInput.value || 1;
        localStorage.setItem('productoCompra', JSON.stringify({
            productoId: productoActual.id_publicacion,
            cantidad: cantidad,
            vendedor: vendedorActual.id_usuario,
            total: actualizarPrecioTotal()
        }));
        console.log("HOLAAA"+localStorage.getItem('productoCompra'))
        window.location.href = '/pages/pago.html'; 
    } else {
        mostrarAlerta('⚠️ Debes iniciar sesión para comprar', 'warning');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1500);
    }
});

>>>>>>> 360cc9d684137b5388400e5fd6af31bc3cccabe7
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);


    } catch (error) {
        console.error('Error al cargar:', error);
        mostrarError(error.message || 'Error al cargar el producto');
    }

});

function renderProducto(producto) {
    const descripcion = document.getElementById('card-text');
    const titulo = document.getElementById('card-title');
    const precio = document.getElementById('precio');
    const img = document.getElementById('productoPublicado');


    titulo.textContent = producto.titulo_publicacion || 'Producto sin título';
    descripcion.textContent = producto.descripcion_publicacion || 'Sin descripción disponible';


    const precioFormateado = parseFloat(producto.precio_producto).toFixed(2);
    precio.textContent = `$${precioFormateado}`;


    let imageSrc = procesarImagen(producto.foto_publicacion);

    img.src = imageSrc;
    img.alt = producto.titulo_publicacion || 'Producto';


    img.onerror = function () {
        this.src = 'https://via.placeholder.com/450x450/fc4b08/ffffff?text=Sin+Imagen';
    };
}

function procesarImagen(fotoPublicacion) {
    let imageSrc = "";

    if (fotoPublicacion) {
        if (Array.isArray(fotoPublicacion)) {

            const base64String = btoa(String.fromCharCode.apply(null, fotoPublicacion));
            imageSrc = `data:image/jpeg;base64,${base64String}`;
        } else if (typeof fotoPublicacion === 'string') {

            if (fotoPublicacion.startsWith('data:image')) {
                imageSrc = fotoPublicacion;
            } else {
                imageSrc = `data:image/jpeg;base64,${fotoPublicacion}`;
            }
        }
    } else {

        imageSrc = 'https://via.placeholder.com/450x450/fc4b08/ffffff?text=Sin+Imagen';
    }

    return imageSrc;
}

function renderDetallesVendedor(vendedor, existencia, calificacion) {
    const infor = document.getElementById('contenedorDetalles');
    let calificacionTransformada = 0
    if (calificacion.promedio !== null) {
        calificacionTransformada = calificacion.promedio
    }
    const estrellasHTML = generarEstrellas(calificacionTransformada);

    infor.innerHTML = `
        <h5><i class="fa-solid fa-store"></i> Información de publicacion</h5>
        <p>
            <i class="fa-solid fa-user"></i> 
            <strong>${vendedor.nombre_usuario || 'Vendedor'}</strong>
        </p>
        <p>
            <i class="fa-solid fa-star"></i> 
            ${estrellasHTML} 
            <span style="color: #666;">(${calificacionTransformada.toFixed(1)})</span>
        </p>
        <div id="horarios_container">
        <p>
        <i class="fa-solid fa-clock"></i> 
        Horarios de entregas:
        </p>
        </div> 
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

function generarEstrellas(calificacion) {
    const estrellasCompletas = Math.floor(calificacion);
    const tieneMedia = (calificacion % 1) >= 0.5;
    let html = '';

    for (let i = 0; i < estrellasCompletas; i++) {
        html += '<i class="fa-solid fa-star" style="color: #ffc107;"></i>';
    }

    if (tieneMedia) {
        html += '<i class="fa-solid fa-star-half-stroke" style="color: #ffc107;"></i>';
    }

    const estrellasVacias = 5 - estrellasCompletas - (tieneMedia ? 1 : 0);
    for (let i = 0; i < estrellasVacias; i++) {
        html += '<i class="fa-regular fa-star" style="color: #ffc107;"></i>';
    }

    return html;
}


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


function mostrarAlerta(mensaje, tipo = 'info') {

    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertaDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    alertaDiv.innerHTML = `
        <strong>${mensaje}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(alertaDiv);

    setTimeout(() => {
        alertaDiv.classList.remove('show');
        setTimeout(() => alertaDiv.remove(), 200);
    }, 3000);
}

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

function renderHorarios() {
    const contenedor = document.getElementById("horarios_container");
    if (!contenedor) return;

    // Si la lista está vacía
    if (!listaHorarios || listaHorarios.length === 0) {
        contenedor.innerHTML = `
            <p>
                <i class="fa-solid fa-clock"></i> 
                Horarios de entrega: <strong>No disponible</strong>
            </p>
        `;
        return;
    }

    // Construir <option> dinámicos
    let opciones = `<option value="">Selecciona horario</option>`;

    listaHorarios.map(h => {
        let hrTransform=h.hora+":00"
        if(hrTransform<10){
            hrTransform="0"+h.hora+":00"
        }
        opciones += `
            <option value="${h.id_horario}">
                ${hrTransform}
            </option>
        `;
    });

    // Render final
    contenedor.innerHTML = `
        <p><i class="fa-solid fa-clock"></i> Horarios de entregas:</p>
        <select id="select_horario">
            ${opciones}
        </select>
    `;
}
