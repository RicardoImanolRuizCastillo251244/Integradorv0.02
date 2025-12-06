import { BASE_URL } from "./api_url.js";

// Variable global para almacenar la compra actual que se va a reportar
let compraActual = null;

// Función para configurar la navegación de los tabs según el rol
function configurarNavegacionTabs(rol) {
    console.log('Configurando tabs en compraconcretadas para rol:', rol);
    
    const comprasTab = document.getElementById('compras');
    const estadisticasTab = document.getElementById('estadisticas');
    const membresiaTab = document.getElementById('membresia');
    const informacionTab = document.getElementById('informacion');
    
    // Configurar tab de información (siempre igual para todos)
    if (informacionTab) {
        informacionTab.onclick = null;
        informacionTab.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'infousuario.html';
        });
    }
    
    if (rol == "2" || rol === 2) {
        // Usuario VENDEDOR - este archivo NO debería ser accesible
        console.warn('Un vendedor está accediendo a compraconcretadas.html - redirigiendo a ventas');
        // Redirigir a ventas
        window.location.href = './vendedor/ventas.html';
        return;
        
    } else if (rol == "1" || rol === 1) {
        // Usuario CONSUMIDOR
        console.log('Vista correcta: CONSUMIDOR viendo sus compras');
        
        // Ocultar tabs de vendedor
        if (estadisticasTab) estadisticasTab.style.display = 'none';
        if (membresiaTab) membresiaTab.style.display = 'none';
        
        // El tab "Compras" ya está en la página actual, solo marcarlo como activo
        if (comprasTab) {
            comprasTab.classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem("rol");
    
    // Configurar navegación de tabs según el rol
    configurarNavegacionTabs(rol);
    
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
    console.log('Rol del usuario:', rol); // Debug
    
    const membresia = document.getElementById('membresia');
    const estadisticas = document.getElementById('estadisticas');
    const btnPublicar = document.getElementById('buttonPost'); 

    if (rol == "1") { // Consumidor (comparación con string)
        console.log('Usuario es CONSUMIDOR - ocultando membresía y estadísticas');
        if (membresia) {
            membresia.style.display = 'none';
            console.log('Membresía ocultada');
        }
        if (estadisticas) {
            estadisticas.style.display = 'none';
            console.log('Estadísticas ocultadas');
        }
    } else if (rol == "2") { // Vendedor
        console.log('Usuario es VENDEDOR');
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
        
        // Tipo de pago
        const tipoPago = compra.tipoPago || 'No especificado';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><h3 class="fuenteTabla fw-bold">${compra.vendedorNombre || 'Desconocido'}</h3></td>
            <td><h3 class="fuenteTabla">${compra.tituloPublicacion || 'Producto eliminado'}</h3></td>
            <td><h3 class="fuenteTabla text-success">$${compra.precioTotal}</h3></td>
            <td><h3 class="fuenteTabla">${compra.cantidadVendida}</h3></td>
            <td>
                <span class="badge ${tipoPago === 'Transferencia' ? 'bg-primary' : 'bg-success'}">
                    ${tipoPago}
                </span>
            </td>
            <td>
                <a href="/pages/comprar.html?id=${compra.idPublicacion}">    
                    <img src="${imageSrc}" class="img-tabla rounded" alt="Producto" style="width: 60px; height: 60px; object-fit: cover;">
                </a>
            </td>
            <td><h3 class="fuenteTabla">${fechaStr}</h3></td>
            <td>
                <button class="btn btn-sm btn-warning" 
                        onclick="abrirModalReporteCompra(${compra.idVenta}, '${compra.vendedorNombre}', '${compra.tituloPublicacion}')">
                    <i class="fas fa-exclamation-triangle"></i> Reportar
                </button>
            </td>
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
// Funci�n para abrir modal de reporte de compra
window.abrirModalReporteCompra = function(idVenta, vendedor, producto) {
    compraActual = idVenta;
    document.getElementById('modal-id-venta').textContent = idVenta;
    document.getElementById('modal-vendedor').textContent = vendedor;
    document.getElementById('modal-producto').textContent = producto;
    document.getElementById('modal-tipo-problema').value = '';
    document.getElementById('modal-descripcion-problema').value = '';
    document.getElementById('modal-evidencia-problema').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalReportarCompra'));
    modal.show();
}

// Funci�n para enviar queja de compra
window.enviarQuejaCompra = async function() {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const tipoProblema = document.getElementById('modal-tipo-problema').value;
    const descripcion = document.getElementById('modal-descripcion-problema').value.trim();
    const evidenciaFile = document.getElementById('modal-evidencia-problema').files[0];
    
    if (!tipoProblema) {
        alert('Por favor selecciona el tipo de problema');
        return;
    }
    
    if (!descripcion) {
        alert('Por favor describe el problema');
        return;
    }
    
    const formData = new FormData();
    formData.append('id_usuario', userId);
    formData.append('id_venta', compraActual);
    formData.append('tipo_problema', tipoProblema);
    formData.append('descripcion_queja', descripcion);
    
    if (evidenciaFile) {
        formData.append('imagen', evidenciaFile);
    }
    
    try {
        const response = await fetch(`${BASE_URL}queja-venta`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) throw new Error('Error al enviar queja');
        
        alert('Reporte enviado exitosamente. Los administradores lo revisarán.');
        bootstrap.Modal.getInstance(document.getElementById('modalReportarCompra')).hide();
        fetchVenta();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el reporte. Intenta de nuevo.');
    }
}
