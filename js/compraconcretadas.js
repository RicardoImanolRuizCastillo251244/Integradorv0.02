import { BASE_URL } from "./api_url.js";

let ventas = [];
let cargando = false; // Prevenir múltiples cargas

document.addEventListener('DOMContentLoaded', () => {
    fetchVenta();
});

async function fetchVenta() {
    // Prevenir múltiples llamadas simultáneas
    if (cargando) {
        console.log('Ya hay una carga en proceso...');
        return;
    }
    
    cargando = true;
    
    try {
        console.log('Iniciando fetch de ventas...');
        const response = await fetch(BASE_URL + 'venta');
        console.log('Respuesta status:', response.status);

        if (response.ok) {
            ventas = await response.json();
            console.log('Ventas recibidas:', ventas);
            mostrarTabla(ventas);
        } else {
            console.error('Error al obtener ventas. Status:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    } finally {
        cargando = false;
    }
}

function mostrarTabla(ventas) {
    const tablaContainer = document.getElementById("tabla-concretadas");
    
    if (!tablaContainer) {
        console.error('No se encontró el contenedor de tabla');
        return;
    }
    
    // Verificar si hay ventas
    if (!ventas || ventas.length === 0) {
        console.log('No hay compras para mostrar');
        tablaContainer.classList.remove('d-none');
        tablaContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h3 class="text-muted">No hay compras concretadas</h3>
                <p class="text-secondary">Aún no has realizado ninguna compra</p>
            </div>
        `;
        return;
    }

    // Buscar el tbody existente
    const tbody = tablaContainer.querySelector('tbody');
    
    if (!tbody) {
        console.error('No se encontró el tbody en la tabla');
        return;
    }

    // Limpiar contenido existente
    tbody.innerHTML = '';

    // Construir las filas de la tabla
    ventas.forEach((venta, index) => {
        console.log(`Procesando venta ${index + 1}:`, venta);
        
        const fila = document.createElement('tr');
        
        // Formatear la fecha de manera segura
        let fechaFormateada = 'Fecha no disponible';
        try {
            if (venta.fecha_compra) {
                const fecha = new Date(venta.fecha_compra);
                if (!isNaN(fecha.getTime())) {
                    fechaFormateada = fecha.toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }
            }
        } catch (e) {
            console.error('Error al formatear fecha:', e);
        }

        // Usar una imagen por defecto válida o placeholder
        const imagenUrl = venta.foto_url || 'https://via.placeholder.com/50x50?text=Sin+Imagen';

        fila.innerHTML = `
            <td>${venta.usuario || venta.nombre_usuario || 'Usuario desconocido'}</td>
            <td>${venta.titulo || venta.nombre_producto || 'Sin título'}</td>
            <td>$${venta.monto_total || venta.precio || '0'}</td>
            <td>
                <img src="${imagenUrl}" 
                     class="img-tabla" 
                     alt="Producto"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/50x50?text=Error';">
            </td>
            <td>${fechaFormateada}</td>
            <td>
                <a href="detalle-compra.html?id=${venta.id || venta._id || ''}" 
                   class="ver-detalles">Ver detalles</a>
            </td>
        `;
        
        tbody.appendChild(fila);
    });

    // Remover la clase d-none para mostrar la tabla
    tablaContainer.classList.remove('d-none');
    
    console.log(`✅ Se mostraron ${ventas.length} compra(s) exitosamente`);
}

function mostrarError() {
    const tablaContainer = document.getElementById("tabla-concretadas");
    
    if (!tablaContainer) return;
    
    tablaContainer.classList.remove('d-none');
    tablaContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h3 class="text-danger">Error al cargar las compras</h3>
            <p class="text-secondary">No se pudieron cargar los datos. Intenta nuevamente.</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">
                <i class="fas fa-sync-alt me-2"></i>Reintentar
            </button>
        </div>
    `;
}

// Botón regresar
const returnButton = document.getElementById("return");
if (returnButton) {
    returnButton.addEventListener("click", () => {
        window.location.href = '../index.html';
    });
}