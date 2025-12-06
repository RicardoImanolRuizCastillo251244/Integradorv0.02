// API URL
import { BASE_URL } from './api_url.js';

// Variables globales
let ventaActual = null;

// Función para configurar la navegación de los tabs según el rol
function configurarNavegacionTabs(rol) {
    console.log('Configurando tabs en ventas para rol:', rol);
    
    const ventasTab = document.getElementById('ventas');
    const estadisticasTab = document.getElementById('estadisticas');
    const membresiaTab = document.getElementById('membresia');
    const informacionTab = document.getElementById('informacion');
    
    // Configurar tab de información
    if (informacionTab) {
        informacionTab.onclick = null;
        informacionTab.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../infousuario.html';
        });
    }
    
    if (rol == "2" || rol === 2) {
        // Usuario VENDEDOR - vista correcta
        console.log('Vista correcta: VENDEDOR viendo sus ventas');
        
        // El tab "Ventas" ya está en la página actual, marcarlo como activo
        if (ventasTab) {
            ventasTab.classList.add('active');
        }
        
        // Configurar tabs de vendedor
        if (estadisticasTab) {
            estadisticasTab.style.display = 'block';
            estadisticasTab.onclick = null;
            estadisticasTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'estadisticas-ventas.html';
            });
        }
        
        if (membresiaTab) {
            membresiaTab.style.display = 'block';
            membresiaTab.onclick = null;
            membresiaTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'pagomenbre.html';
            });
        }
        
    } else if (rol == "1" || rol === 1) {
        // Usuario CONSUMIDOR - NO debería estar aquí
        console.warn('Un consumidor está accediendo a ventas.html - redirigiendo a compras');
        window.location.href = '../pages/compraconcretadas.html';
        return;
    }
}

// Cargar ventas al iniciar
document.addEventListener('DOMContentLoaded', function () {
    const rol = localStorage.getItem("rol");
    
    // Configurar navegación de tabs según el rol
    configurarNavegacionTabs(rol);
    
    cargarVentas();
    
    // Los tabs ahora se configuran en configurarNavegacionTabs(), remover este bloque
    // document.querySelectorAll(".tabs-usuario .tab").forEach((tab, index) => {
    //     tab.addEventListener("click", () => {
    //         if (index === 0) window.location.href = "infousuario.html";
    //         if (index === 1) window.location.href = "pagomenbre.html";
    //         if (index === 2) window.location.href = "compraconcretadas.html";
    //         if (index === 3) window.location.href = "estadisticas.html";
    //     });
    // });
});

// Función para cargar todas las ventas del vendedor
async function cargarVentas() {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        window.location.href = '../login.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}venta/vendedor/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar ventas');

        const ventas = await response.json();
        mostrarVentas(ventas);
        actualizarEstadisticas(ventas);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tbody-ventas').innerHTML = 
            '<tr><td colspan="8" class="text-center text-danger">Error al cargar ventas</td></tr>';
    }
}

// Función para mostrar ventas en la tabla
function mostrarVentas(ventas) {
    const tbody = document.getElementById('tbody-ventas');
    
    if (!ventas || ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay ventas registradas</td></tr>';
        return;
    }

    tbody.innerHTML = ventas.map(venta => {
        const compradorNombre = venta.comprador_nombre || 'Comprador desconocido';
        const tipoPago = venta.tipo_pago || 'No especificado';
        const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-MX');
        const monto = parseFloat(venta.precio_total || 0).toFixed(2);
        
        // Determinar si tiene comprobante
        const tieneComprobante = venta.imagen && venta.imagen.length > 0;
        const btnComprobante = tieneComprobante 
            ? `<button class="btn btn-sm btn-info" onclick="verComprobante('${venta.imagen}')">
                 <i class="fas fa-file-image"></i> Ver
               </button>`
            : '<span class="text-muted">N/A</span>';
        
        // Botón de reportar solo si hay comprobante sospechoso
        const btnReportar = tieneComprobante
            ? `<button class="btn btn-sm btn-warning" onclick="abrirModalReporte(${venta.id_venta}, '${compradorNombre}')">
                 <i class="fas fa-exclamation-triangle"></i> Reportar
               </button>`
            : '';

        return `
            <tr>
                <td>${compradorNombre}</td>
                <td>${venta.titulo_publicacion || 'Producto'}</td>
                <td>${venta.cantidad_vendida || 1}</td>
                <td>$${monto}</td>
                <td>
                    <span class="badge ${tipoPago === 'Transferencia' ? 'bg-primary' : 'bg-success'}">
                        ${tipoPago}
                    </span>
                </td>
                <td>${btnComprobante}</td>
                <td>${fecha}</td>
                <td>${btnReportar}</td>
            </tr>
        `;
    }).join('');
}

// Función para actualizar estadísticas
function actualizarEstadisticas(ventas) {
    const totalVentas = ventas.length;
    const montoTotal = ventas.reduce((sum, v) => sum + parseFloat(v.precio_total || 0), 0);
    
    document.getElementById('total-ventas').textContent = totalVentas;
    document.getElementById('monto-total').textContent = `$${montoTotal.toFixed(2)}`;
}

// Función para ver comprobante en modal
window.verComprobante = function(imagenBase64) {
    const imgElement = document.getElementById('img-comprobante');
    
    // Si ya viene en base64
    if (imagenBase64.startsWith('data:image')) {
        imgElement.src = imagenBase64;
    } else if (Array.isArray(imagenBase64)) {
        // Si es un array de bytes
        const base64 = btoa(String.fromCharCode.apply(null, imagenBase64));
        imgElement.src = `data:image/jpeg;base64,${base64}`;
    } else {
        // Asumir que es base64 sin prefijo
        imgElement.src = `data:image/jpeg;base64,${imagenBase64}`;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('modalComprobante'));
    modal.show();
}

// Función para abrir modal de reporte
window.abrirModalReporte = function(idVenta, nombreComprador) {
    ventaActual = idVenta;
    document.getElementById('modal-venta-id').textContent = idVenta;
    document.getElementById('modal-comprador').textContent = nombreComprador;
    document.getElementById('modal-descripcion').value = '';
    document.getElementById('modal-evidencia').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalReportarPago'));
    modal.show();
}

// Función para enviar queja de venta
window.enviarQuejaVenta = async function() {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const descripcion = document.getElementById('modal-descripcion').value.trim();
    const evidenciaFile = document.getElementById('modal-evidencia').files[0];
    
    if (!descripcion) {
        alert('Por favor describe el problema');
        return;
    }
    
    const formData = new FormData();
    formData.append('id_usuario', userId);
    formData.append('id_venta', ventaActual);
    formData.append('tipo_problema', 'Comprobante de pago falso');
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
        bootstrap.Modal.getInstance(document.getElementById('modalReportarPago')).hide();
        cargarVentas(); // Recargar tabla
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el reporte. Intenta de nuevo.');
    }
}
