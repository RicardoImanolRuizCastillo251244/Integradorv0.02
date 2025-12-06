// Script para manejar quejas de ventas del admin
import { BASE_URL } from './api_url.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarQuejasVenta();

    // Verificar si hay una pestaña activa guardada desde notificaciones
    const quejaTabActiva = localStorage.getItem('quejaTabActiva');
    if (quejaTabActiva === 'QUEJA_VENTA') {
        // Activar la pestaña de quejas de venta
        const ventaTab = document.getElementById('quejas-venta-tab');
        if (ventaTab) {
            ventaTab.click();
        }
        localStorage.removeItem('quejaTabActiva');
    }
});

async function cargarQuejasVenta() {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../login.html';
        return;
    }

    try {
        const response = await fetch(BASE_URL + 'queja-venta', {
            headers: {
                'Authorization': authToken
            }
        });

        if (!response.ok) throw new Error('Error al cargar quejas de venta');

        const quejas = await response.json();
        console.log('Quejas recibidas:', quejas);
        renderTablaQuejas(quejas);
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('tbody-quejas-venta');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error al cargar quejas</td></tr>';
        }
    }
}

function renderTablaQuejas(quejas) {
    const tbody = document.getElementById('tbody-quejas-venta');

    if (!tbody) return;

    if (!quejas || quejas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay quejas de venta registradas</td></tr>';
        return;
    }

    tbody.innerHTML = quejas.map(queja => {
        const fecha = new Date(queja.fecha_emision || queja.fecha_creacion).toLocaleDateString('es-MX');
        const estadoBadge = obtenerBadgeEstado(queja.estado_queja || queja.estado);
        const tieneEvidencias = queja.imagen;
        const idQueja = queja.id_queja || queja.id; // Usar id_queja o id

        return `
            <tr>
                <td>${idQueja}</td>
                <td>${queja.id_venta || 'N/A'}</td>
                <td><strong>ID: ${queja.id_emisor}</strong></td>
                <td>
                    <span class="badge bg-danger">${queja.tipo_problema || 'Fraude'}</span>
                </td>
                <td>
                    <span class="badge bg-primary">Por cargar</span>
                </td>
                <td colspan="2" class="text-center">
                    <small class="text-muted">Se cargarán desde detalle de venta</small>
                </td>
                <td>${fecha}</td>
                <td>
                    ${estadoBadge}
                    <br>
                    ${tieneEvidencias ?
                        `<button class="btn btn-sm btn-warning mt-1" onclick="verEvidencias(${idQueja}, '${procesarImagenBase64(queja.imagen)}')">
                            <i class="fas fa-image"></i> Ver Evidencias
                        </button>
                        <br>` :
                        ''
                    }
                    <button class="btn btn-sm btn-primary mt-1" onclick="verDetalleQuejaCompleto(${idQueja})">
                        <i class="fas fa-gavel"></i> Sala de Arbitraje
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function obtenerBadgeEstado(estado) {
    const badges = {
        'ABIERTA': '<span class="badge bg-danger">Abierta</span>',
        'CERRADA': '<span class="badge bg-success">Cerrada</span>',
        'PENDIENTE': '<span class="badge bg-warning">Pendiente</span>',
        'EN_REVISION': '<span class="badge bg-info">En Revisión</span>',
        'RESUELTA': '<span class="badge bg-success">Resuelta</span>',
        'DESESTIMADA': '<span class="badge bg-secondary">Desestimada</span>'
    };
    return badges[estado] || '<span class="badge bg-warning">Abierta</span>';
}

// ========== SALA DE ARBITRAJE: Ver Detalle Completo de Queja de Venta ==========
// Esta es la vista más importante del administrador para tomar decisiones de seguridad
window.verDetalleQuejaCompleto = async function(idQueja) {
    const authToken = localStorage.getItem('authToken');

    try {
        // PASO 1: Obtener los datos de la QUEJA (La Acusación)
        const quejaResponse = await fetch(BASE_URL + `queja-venta/${idQueja}`, {
            headers: { 'Authorization': authToken }
        });

        if (!quejaResponse.ok) {
            throw new Error('Error al cargar la queja');
        }

        const queja = await quejaResponse.json();
        console.log('Datos de la queja:', queja);

        // PASO 2: Obtener los datos de la VENTA ORIGINAL (La Evidencia del Acusado)
        const ventaResponse = await fetch(BASE_URL + `venta/${queja.id_venta}`, {
            headers: { 'Authorization': authToken }
        });

        if (!ventaResponse.ok) {
            throw new Error('Error al cargar los datos de la venta');
        }

        const venta = await ventaResponse.json();
        console.log('Datos de la venta:', venta);

        // PASO 3: Llenar el modal con la información comparativa
        mostrarModalArbitraje(queja, venta);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el detalle de la queja: ' + error.message);
    }
}

// Función para mostrar el modal de arbitraje con comparación de evidencias
function mostrarModalArbitraje(queja, venta) {
    // INFO GENERAL DE LA QUEJA
    document.getElementById('detalle-id-queja').textContent = queja.id;
    document.getElementById('detalle-id-venta').textContent = queja.id_venta;
    document.getElementById('detalle-tipo-problema').textContent = queja.tipo_problema || 'Fraude';
    document.getElementById('detalle-descripcion').textContent = queja.descripcion_queja || 'Sin descripción';

    const fecha = new Date(queja.fecha_emision);
    document.getElementById('detalle-fecha').textContent = fecha.toLocaleString('es-MX');
    document.getElementById('detalle-estado').innerHTML = obtenerBadgeEstado(queja.estado_queja);

    // TIPO DE PAGO (CRÍTICO PARA VALIDAR FRAUDES)
    document.getElementById('detalle-tipo-pago').textContent = venta.tipo_pago || 'No especificado';

    // INFO DEL EMISOR (Quien reportó la queja)
    document.getElementById('detalle-emisor-nombre').textContent = `ID: ${queja.id_emisor}`;
    document.getElementById('detalle-emisor-correo').textContent = 'Por obtener';

    // INFO DEL COMPRADOR (desde la venta)
    document.getElementById('detalle-comprador-id').textContent = venta.id_comprador || 'N/A';
    document.getElementById('detalle-comprador-nombre').textContent = 'Por obtener';
    document.getElementById('detalle-comprador-correo').textContent = '';

    // INFO DEL VENDEDOR (necesitamos obtenerlo de la publicación)
    document.getElementById('detalle-vendedor-id').textContent = 'Por obtener';
    document.getElementById('detalle-vendedor-nombre').textContent = 'Por obtener';
    document.getElementById('detalle-vendedor-correo').textContent = '';

    // ========== COMPARACIÓN DE EVIDENCIAS ==========
    // Crear sección de evidencias si no existe
    let seccionEvidencias = document.getElementById('seccion-evidencias-comparativa');
    if (!seccionEvidencias) {
        // Insertar antes de las partes involucradas
        const contenedor = document.querySelector('#modalDetalleQueja .modal-body');
        const hr = contenedor.querySelector('hr');

        seccionEvidencias = document.createElement('div');
        seccionEvidencias.id = 'seccion-evidencias-comparativa';
        seccionEvidencias.className = 'mb-4';
        contenedor.insertBefore(seccionEvidencias, hr);
    }

    // Renderizar comparación VS
    seccionEvidencias.innerHTML = `
        <h6 class="text-center mb-3" style="color: #c00000;">⚖️ COMPARACIÓN DE EVIDENCIAS</h6>
        <div class="row">
            <!-- LADO IZQUIERDO: LA ACUSACIÓN (Evidencia de la Queja) -->
            <div class="col-md-6">
                <div class="card border-danger">
                    <div class="card-header bg-danger text-white text-center">
                        <i class="fas fa-exclamation-triangle"></i> EVIDENCIA DE LA QUEJA
                    </div>
                    <div class="card-body">
                        <p><strong>Descripción del problema:</strong></p>
                        <p class="text-muted">${queja.descripcion_queja || 'Sin descripción'}</p>
                        ${queja.imagen ?
                            `<img src="${procesarImagenBase64(queja.imagen)}"
                                 class="img-fluid border rounded mt-2"
                                 alt="Evidencia de la queja"
                                 style="max-height: 300px; width: 100%; object-fit: contain;">
                             <p class="text-center mt-2"><small>📸 Foto subida por quien reporta</small></p>` :
                            '<p class="text-center text-muted">Sin imagen adjunta</p>'
                        }
                    </div>
                </div>
            </div>

            <!-- LADO DERECHO: LA EVIDENCIA ORIGINAL (Comprobante de Pago) -->
            <div class="col-md-6">
                <div class="card border-success">
                    <div class="card-header bg-success text-white text-center">
                        <i class="fas fa-file-invoice-dollar"></i> COMPROBANTE ORIGINAL DE PAGO
                    </div>
                    <div class="card-body">
                        <p><strong>Tipo de pago registrado:</strong></p>
                        <p><span class="badge bg-primary">${venta.tipo_pago || 'No especificado'}</span></p>
                        ${venta.imagen ?
                            `<img src="${procesarImagenBase64(venta.imagen)}"
                                 class="img-fluid border rounded mt-2"
                                 alt="Comprobante de pago original"
                                 style="max-height: 300px; width: 100%; object-fit: contain;">
                             <p class="text-center mt-2"><small>💳 Foto de transferencia/comprobante</small></p>` :
                            '<p class="text-center text-muted">Sin comprobante de pago</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        <div class="alert alert-warning mt-3">
            <i class="fas fa-gavel"></i> <strong>Instrucción de Arbitraje:</strong>
            Compare ambas evidencias. ¿El comprobante de pago es auténtico? ¿Las fechas coinciden?
            Si hay fraude comprobado, puede banear al usuario culpable.
        </div>
    `;

    // Configurar botones de acción
    configurarBotonesAccion(queja, venta);

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleQueja'));
    modal.show();
}

// ========== CONFIGURAR BOTONES DE ACCIÓN ==========
function configurarBotonesAccion(queja, venta) {
    // Botón: Cerrar Caso (Desestimar)
    const btnCerrarCaso = document.getElementById('btn-desestimar-queja');
    if (btnCerrarCaso) {
        btnCerrarCaso.onclick = () => cerrarCaso(queja);
    }

    // Botón: Resolver (marcar como cerrada también)
    const btnResolver = document.getElementById('btn-resolver-queja');
    if (btnResolver) {
        btnResolver.onclick = () => cerrarCaso(queja, 'CERRADA');
    }

    // Botón: Banear Comprador
    const btnBanearComprador = document.getElementById('btn-banear-comprador');
    if (btnBanearComprador) {
        btnBanearComprador.onclick = () => banearUsuario(venta.id_comprador, 'Comprador');
    }

    // Botón: Banear Vendedor (necesitamos obtener el ID del vendedor desde la publicación)
    const btnBanearVendedor = document.getElementById('btn-banear-vendedor');
    if (btnBanearVendedor) {
        btnBanearVendedor.onclick = async () => {
            // Primero obtener la publicación para saber quién es el vendedor
            try {
                const authToken = localStorage.getItem('authToken');
                const pubResponse = await fetch(BASE_URL + `publicacion/${venta.id_publicacion}`, {
                    headers: { 'Authorization': authToken }
                });
                if (pubResponse.ok) {
                    const publicacion = await pubResponse.json();
                    banearUsuario(publicacion.id_usuario, 'Vendedor');
                } else {
                    alert('No se pudo obtener la información del vendedor');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al obtener información del vendedor');
            }
        };
    }
}

// ========== ACCIÓN: CERRAR CASO ==========
async function cerrarCaso(queja, estadoFinal = 'CERRADA') {
    const authToken = localStorage.getItem('authToken');

    if (!confirm('¿Estás seguro de cerrar este caso? La queja dejará de aparecer como pendiente.')) {
        return;
    }

    try {
        // Actualizar la queja con estado CERRADA
        const quejaActualizada = {
            id_venta: queja.id_venta,
            id_emisor: queja.id_emisor,
            descripcion_queja: queja.descripcion_queja,
            estado_queja: estadoFinal,
            tipo_problema: queja.tipo_problema
        };

        const response = await fetch(BASE_URL + `queja-venta/${queja.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quejaActualizada)
        });

        if (response.ok || response.status === 204) {
            alert('✅ Caso cerrado exitosamente');
            bootstrap.Modal.getInstance(document.getElementById('modalDetalleQueja')).hide();
            cargarQuejasVenta(); // Recargar tabla
        } else {
            const errorText = await response.text();
            alert(`Error al cerrar el caso: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al cerrar el caso');
    }
}

// ========== ACCIÓN: BANEAR USUARIO (BOTÓN ROJO 🔨) ==========
async function banearUsuario(idUsuario, tipoUsuario) {
    const authToken = localStorage.getItem('authToken');

    // Confirmación con advertencia fuerte
    const confirmacion = confirm(
        `⚠️ ¿ESTÁS SEGURO DE BANEAR A ESTE ${tipoUsuario.toUpperCase()}?\n\n` +
        `ID del usuario: ${idUsuario}\n\n` +
        `Esta acción suspenderá permanentemente al usuario.`
    );

    if (!confirmacion) return;

    // Pedir motivo del baneo
    const motivo = prompt('Por favor, ingresa el motivo del baneo (obligatorio):');

    if (!motivo || motivo.trim() === '') {
        alert('Debes proporcionar un motivo para el baneo');
        return;
    }

    try {
        // POST a /usuario-baneado
        const response = await fetch(BASE_URL + 'usuario-baneado', {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: idUsuario,
                motivo: motivo.trim()
            })
        });

        if (response.ok || response.status === 201) {
            alert(`🔨 Usuario bloqueado exitosamente.\n\nMotivo: ${motivo}`);
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('modalDetalleQueja')).hide();
        } else {
            const errorText = await response.text();
            alert(`Error al banear usuario: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al banear usuario');
    }
}

// Función auxiliar para procesar imágenes base64
function procesarImagenBase64(img) {
    if (!img) return '';
    if (img.startsWith('data:image')) return img;
    return `data:image/jpeg;base64,${img}`;
}

// ========== VER EVIDENCIAS EN MODAL ==========
window.verEvidencias = function(idQueja, imagenBase64) {
    const modalBody = document.getElementById('modal-evidencias-body');

    modalBody.innerHTML = `
        <div class="text-center">
            <h6 class="mb-3">Evidencia de Queja #${idQueja}</h6>
            <img src="${imagenBase64}"
                 class="img-fluid border rounded"
                 alt="Evidencia de la queja"
                 style="max-height: 600px; object-fit: contain;">
            <p class="text-muted mt-3">
                <i class="fas fa-info-circle"></i> Imagen adjuntada por quien reportó la queja
            </p>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalEvidencias'));
    modal.show();
}

