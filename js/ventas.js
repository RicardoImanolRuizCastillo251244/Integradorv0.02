// API URL
import { BASE_URL } from './api_url.js';

// Variables globales
window.ventaActual = null;

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
        window.location.href = '../compraconcretadas.html';
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
        const compradorNombre = venta.compradorNombre || 'Comprador desconocido';
        const tipoPago = venta.tipoPago || 'No especificado';
        const fechaVenta = venta.fechaVenta;
        let fechaStr = 'Invalid Date';
        
        // Formatear fecha desde LocalDateTime
        if (fechaVenta && Array.isArray(fechaVenta)) {
            const [anio, mes, dia, hora, min] = fechaVenta;
            const minStr = min < 10 ? '0' + min : min;
            fechaStr = `${dia}/${mes}/${anio}`;
        }
        
        const monto = parseFloat(venta.precioTotal || 0).toFixed(2);
        
        // Determinar si tiene comprobante
        const tieneComprobante = venta.imagenTransferencia && venta.imagenTransferencia.length > 0;
        const btnComprobante = tieneComprobante 
            ? `<button class="btn btn-sm btn-info btn-ver-comprobante" data-imagen="${venta.imagenTransferencia}">
                 <i class="fas fa-file-image"></i> Ver
               </button>`
            : '<span class="text-muted">N/A</span>';
        
        // Botón de reportar SIEMPRE disponible
        const btnReportar = `<button class="btn btn-sm btn-warning btn-reportar-venta" 
                                     data-id-venta="${venta.idCompra}" 
                                     data-comprador="${compradorNombre}" 
                                     data-tipo-pago="${tipoPago}">
                 <i class="fas fa-exclamation-triangle"></i> Reportar
               </button>`;

        return `
            <tr>
                <td>${compradorNombre}</td>
                <td>${venta.tituloPublicacion || 'Producto'}</td>
                <td>${venta.cantidadVendida || 1}</td>
                <td>$${monto}</td>
                <td>
                    <span class="badge ${tipoPago === 'Transferencia' ? 'bg-primary' : 'bg-success'}">
                        ${tipoPago}
                    </span>
                </td>
                <td>${btnComprobante}</td>
                <td>${fechaStr}</td>
                <td>${btnReportar}</td>
            </tr>
        `;
    }).join('');
    
    // Agregar event listeners a los botones de reportar
    document.querySelectorAll('.btn-reportar-venta').forEach(btn => {
        btn.addEventListener('click', function() {
            const idVenta = this.getAttribute('data-id-venta');
            const comprador = this.getAttribute('data-comprador');
            const tipoPago = this.getAttribute('data-tipo-pago');
            window.abrirModalReporte(idVenta, comprador, tipoPago);
        });
    });
    
    // Agregar event listeners a los botones de ver comprobante
    document.querySelectorAll('.btn-ver-comprobante').forEach(btn => {
        btn.addEventListener('click', function() {
            const imagen = this.getAttribute('data-imagen');
            window.verComprobante(imagen);
        });
    });
}

// Función para actualizar estadísticas
function actualizarEstadisticas(ventas) {
    const totalVentas = ventas.length;
    const montoTotal = ventas.reduce((sum, v) => sum + parseFloat(v.precioTotal || 0), 0);
    
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
window.abrirModalReporte = function(idVenta, nombreComprador, tipoPago) {
    console.log('abrirModalReporte llamada con idVenta:', idVenta);
    
    // Guardar en el modal como atributo data
    const modalElement = document.getElementById('modalReportarPago');
    modalElement.setAttribute('data-id-venta-actual', idVenta);
    
    // Mostrar información de contexto
    const infoContexto = document.getElementById('modal-info-contexto');
    infoContexto.innerHTML = `Reportando venta al comprador <strong>${nombreComprador}</strong> (Tipo de pago: <strong>${tipoPago}</strong>)`;
    
    document.getElementById('modal-tipo-problema').value = '';
    document.getElementById('modal-descripcion').value = '';
    document.getElementById('modal-evidencia').value = '';
    const preview = document.getElementById('modal-preview');
    if (preview) preview.style.display = 'none';
    
    // Configurar placeholder según el tipo de pago
    const inputProblema = document.getElementById('modal-tipo-problema');
    if (tipoPago === 'Efectivo') {
        inputProblema.placeholder = 'Ej: Comprador no se presentó (Ghosting)';
    } else {
        inputProblema.placeholder = 'Ej: Comprobante de pago falso';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('modalReportarPago'));
    modal.show();
}

// Función para enviar queja de venta
window.enviarQuejaVenta = async function() {
    console.log('=== INICIANDO enviarQuejaVenta ===');
    
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const tipoProblema = document.getElementById('modal-tipo-problema').value.trim();
    const descripcion = document.getElementById('modal-descripcion').value.trim();
    const evidenciaFile = document.getElementById('modal-evidencia').files[0];
    
    console.log('Token:', token ? 'Existe' : 'NO EXISTE');
    console.log('UserId:', userId);
    console.log('Tipo Problema:', tipoProblema);
    console.log('Descripción length:', descripcion.length);
    
    // Obtener idVenta del atributo data del modal
    const modalElement = document.getElementById('modalReportarPago');
    const idVenta = modalElement.getAttribute('data-id-venta-actual');
    
    console.log('ID Venta desde modal:', idVenta);
    
    if (!tipoProblema) {
        alert('Por favor escribe el motivo de tu queja');
        return;
    }
    
    if (descripcion.length < 20) {
        alert('La descripción debe tener al menos 20 caracteres');
        return;
    }
    
    console.log('Validaciones pasadas, creando FormData...');
    
    const formData = new FormData();
    formData.append('id_emisor', userId);
    formData.append('id_venta', idVenta);
    formData.append('tipo_problema', tipoProblema);
    formData.append('descripcion_queja', descripcion);
    
    if (evidenciaFile) {
        console.log('Agregando imagen:', evidenciaFile.name);
        formData.append('imagen', evidenciaFile);
    }
    
    console.log('Enviando POST a:', `${BASE_URL}queja-venta`);
    
    try {
        const response = await fetch(`${BASE_URL}queja-venta`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Id': userId
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error('Error al enviar queja');
        }
        
        console.log('Queja enviada exitosamente');
        alert('Reporte enviado exitosamente. Los administradores lo revisarán.');
        bootstrap.Modal.getInstance(document.getElementById('modalReportarPago')).hide();
        cargarVentas(); // Recargar tabla
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el reporte. Intenta de nuevo.');
    }
}

// Manejo de contador de caracteres y vista previa de imagen
document.addEventListener('DOMContentLoaded', () => {
    // Contador de caracteres
    const descripcionTextarea = document.getElementById('modal-descripcion');
    const charCount = document.getElementById('modal-char-count');
    
    if (descripcionTextarea && charCount) {
        descripcionTextarea.addEventListener('input', () => {
            const count = descripcionTextarea.value.length;
            charCount.textContent = `${count} caracteres`;
            charCount.classList.toggle('text-danger', count > 0 && count < 20);
            charCount.classList.toggle('text-success', count >= 20);
        });
    }
    
    // Vista previa de imagen
    const evidenciaInput = document.getElementById('modal-evidencia');
    const preview = document.getElementById('modal-preview');
    
    if (evidenciaInput && preview) {
        evidenciaInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen es muy grande. Máximo 5MB.');
                    evidenciaInput.value = '';
                    preview.style.display = 'none';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
    }
});
