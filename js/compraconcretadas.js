import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de UI según rol
    configurarVistaPorRol();

    // 2. Iniciar carga de datos
    fetchVenta();

    // 3. Configurar botón regresar
    const returnButton = document.getElementById("return");
    if (returnButton) {
        returnButton.addEventListener("click", () => {
            window.location.href = '../index.html';
        });
    }
});

function configurarVistaPorRol() {
    const rol = localStorage.getItem("rol");
    const membresia = document.getElementById('membresia');
    const estadisticas = document.getElementById('estadisticas');
    
    // CORRECCIÓN: Validamos que el botón exista antes de ocultarlo
    // (En compraconcretadas.html NO existe el botón de publicar, por eso fallaba tu código anterior)
    const btnPublicar = document.getElementById('buttonPost'); 

    if (rol == 1) { // Consumidor
        if (membresia) membresia.style.display = 'none';
        if (estadisticas) estadisticas.style.display = 'none';
    } else { // Vendedor
        if (btnPublicar) btnPublicar.style.display = 'none';
    }
}

async function fetchVenta() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    if (!userId) {
        mostrarError("No has iniciado sesión.");
        return;
    }
    
    try {
        console.log('Iniciando fetch de ventas...');
        const response = await fetch(`${BASE_URL}compras/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Id': userId
            }
        });

        if (response.ok) {
            const ventas = await response.json();
            console.log('Ventas recibidas:', ventas);
            mostrarTabla(ventas);
        } else {
            const errorText = await response.text();
            console.error('Error backend:', errorText);
            mostrarError(`No se pudieron cargar las compras. (${response.status})`);
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError('Error de conexión con el servidor.');
    }
}

function mostrarTabla(compras) {
    const tablaContainer = document.getElementById("tabla-concretadas");
    if (!tablaContainer) return;
    
    // Verificar si hay ventas
    if (!compras || compras.length === 0) {
        tablaContainer.classList.remove('d-none');
        tablaContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h3 class="text-muted">No tienes compras aún</h3>
                <p class="text-secondary">¡Explora el catálogo y realiza tu primera compra!</p>
                <a href="../index.html" class="btn btn-outline-primary mt-2">Ir al inicio</a>
            </div>
        `;
        return;
    }

    const tbody = tablaContainer.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    compras.forEach((compra) => {
        // Formatear Fecha
        let fechaStr = "Fecha desconocida";
        if (compra.fechaVenta && Array.isArray(compra.fechaVenta)) {
            // [año, mes, dia, hora, minuto, segundo]
            const [anio, mes, dia, hora, min] = compra.fechaVenta;
            const minStr = min < 10 ? '0' + min : min;
            fechaStr = `${dia}/${mes}/${anio} <br> <small>${hora}:${minStr} hrs</small>`;
        }

        // Procesar Imagen
        const imageSrc = procesarImagen(compra.fotoPublicacion);

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><h3 class="fuenteTabla fw-bold">${compra.vendedorNombre || 'Desconocido'}</h3></td>
            <td><h3 class="fuenteTabla">${compra.tituloPublicacion || 'Producto eliminado'}</h3></td>
            <td><h3 class="fuenteTabla text-success">$${compra.precioTotal}</h3></td>
            <td><h3 class="fuenteTabla">${compra.cantidadVendida}</h3></td>
            <td>
                <a href="/pages/comprar.html?id=${compra.idPublicacion}">    
                    <img src="${imageSrc}" class="img-tabla rounded" alt="Producto" style="width: 60px; height: 60px; object-fit: cover;">
                </a>
            </td>
            <td><h3 class="fuenteTabla">${fechaStr}</h3></td>

        `;
        
        tbody.appendChild(fila);
    });

    tablaContainer.classList.remove('d-none');
}

function procesarImagen(foto) {
    if (!foto) return 'https://via.placeholder.com/60?text=Sin+Img';
    
    try {
        if (Array.isArray(foto)) {
            const uint8 = new Uint8Array(foto);
            let binary = '';
            for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
            return `data:image/jpeg;base64,${btoa(binary)}`;
        }
        if (typeof foto === 'string') {
            return foto.startsWith('data:image') ? foto : `data:image/jpeg;base64,${foto}`;
        }
    } catch (e) {
        console.warn("Error procesando imagen", e);
    }
    return 'https://via.placeholder.com/60?text=Error';
}

function mostrarError(msg) {
    const tablaContainer = document.getElementById("tabla-concretadas");
    if (tablaContainer) {
        tablaContainer.classList.remove('d-none');
        tablaContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                <h3 class="text-danger">Ocurrió un error</h3>
                <p class="text-secondary">${msg}</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}