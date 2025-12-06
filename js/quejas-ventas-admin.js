// Script para manejar quejas de ventas del admin
import { API_URL } from './api_url.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarQuejasVenta();
});

async function cargarQuejasVenta() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/queja-venta/details`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar quejas de venta');

        const quejas = await response.json();
        console.log('Quejas recibidas:', quejas);
        renderTablaQuejas(quejas);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tbody-quejas-venta').innerHTML = 
            '<tr><td colspan="9" class="text-center text-danger">Error al cargar quejas</td></tr>';
    }
}

function renderTablaQuejas(quejas) {
    const tbody = document.getElementById('tbody-quejas-venta');
    
    if (!quejas || quejas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay quejas de venta registradas</td></tr>';
        return;
    }

    tbody.innerHTML = quejas.map(queja => {
        const fecha = new Date(queja.fecha_creacion).toLocaleDateString('es-MX');
        const estadoBadge = obtenerBadgeEstado(queja.estado);
        const tieneEvidencias = (queja.imagen_comprobante_pago || queja.imagen_evidencia_queja);
        
        return `
            <tr>
                <td>${queja.id_queja}</td>
                <td>${queja.id_venta || 'N/A'}</td>
                <td><strong>${queja.nombre_usuario}</strong><br><small>${queja.correo_usuario}</small></td>
                <td>${queja.tipo_problema || 'No especificado'}</td>
                <td>
                    <span class="badge ${queja.tipo_pago === 'Transferencia' ? 'bg-primary' : 'bg-success'}">
                        ${queja.tipo_pago || 'N/A'}
                    </span>
                </td>
                <td>
                    <strong>${queja.nombre_comprador || 'N/A'}</strong><br>
                    <small>${queja.correo_comprador || ''}</small>
                </td>
                <td>
                    <strong>${queja.nombre_vendedor || 'N/A'}</strong><br>
                    <small>${queja.correo_vendedor || ''}</small>
                </td>
                <td>${fecha}</td>
                <td>
                    ${estadoBadge}
                    <br>
                    ${tieneEvidencias ? 
                        `<button class="btn btn-sm btn-info mt-1" onclick="verEvidencias(${queja.id_queja})">
                            <i class="fas fa-images"></i> Ver Evidencias
                        </button>` : 
                        '<span class="text-muted">Sin evidencias</span>'
                    }
                    <br>
                    <button class="btn btn-sm btn-primary mt-1" onclick="verDetalleQueja(${queja.id_queja})">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function obtenerBadgeEstado(estado) {
    const badges = {
        'PENDIENTE': '<span class="badge bg-warning">Pendiente</span>',
        'EN_REVISION': '<span class="badge bg-info">En Revisión</span>',
        'RESUELTA': '<span class="badge bg-success">Resuelta</span>',
        'DESESTIMADA': '<span class="badge bg-secondary">Desestimada</span>'
    };
    return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

// Variable global para almacenar las quejas
let quejasGlobal = [];

async function cargarQuejasVenta() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/queja-venta/details`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar quejas de venta');

        quejasGlobal = await response.json();
        console.log('Quejas recibidas:', quejasGlobal);
        renderTablaQuejas(quejasGlobal);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tbody-quejas-venta').innerHTML = 
            '<tr><td colspan="9" class="text-center text-danger">Error al cargar quejas</td></tr>';
    }
}

// Función para ver evidencias en modal
window.verEvidencias = function(idQueja) {
    const queja = quejasGlobal.find(q => q.id_queja === idQueja);
    if (!queja) return;
    
    const modalBody = document.getElementById('modal-evidencias-body');
    let html = '<div class="row">';
    
    // Comprobante de pago
    if (queja.imagen_comprobante_pago) {
        html += `
            <div class="col-md-6 mb-3">
                <h6 class="text-center">Comprobante de Pago</h6>
                <img src="${procesarImagenBase64(queja.imagen_comprobante_pago)}" 
                     class="img-fluid border rounded" 
                     alt="Comprobante de Pago"
                     style="max-height: 400px; width: 100%; object-fit: contain;">
            </div>
        `;
    }
    
    // Evidencia de queja
    if (queja.imagen_evidencia_queja) {
        html += `
            <div class="col-md-6 mb-3">
                <h6 class="text-center">Evidencia de Queja</h6>
                <img src="${procesarImagenBase64(queja.imagen_evidencia_queja)}" 
                     class="img-fluid border rounded" 
                     alt="Evidencia de Queja"
                     style="max-height: 400px; width: 100%; object-fit: contain;">
            </div>
        `;
    }
    
    html += '</div>';
    modalBody.innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('modalEvidencias'));
    modal.show();
}

// Función para ver detalle completo de la queja
window.verDetalleQueja = function(idQueja) {
    const queja = quejasGlobal.find(q => q.id_queja === idQueja);
    if (!queja) return;
    
    document.getElementById('detalle-id-queja').textContent = queja.id_queja;
    document.getElementById('detalle-id-venta').textContent = queja.id_venta || 'N/A';
    document.getElementById('detalle-tipo-problema').textContent = queja.tipo_problema || 'No especificado';
    document.getElementById('detalle-descripcion').textContent = queja.descripcion || 'Sin descripción';
    document.getElementById('detalle-fecha').textContent = new Date(queja.fecha_creacion).toLocaleString('es-MX');
    document.getElementById('detalle-estado').innerHTML = obtenerBadgeEstado(queja.estado);
    
    // Info del emisor (quien reportó)
    document.getElementById('detalle-emisor-nombre').textContent = queja.nombre_usuario;
    document.getElementById('detalle-emisor-correo').textContent = queja.correo_usuario;
    
    // Info del comprador
    document.getElementById('detalle-comprador-id').textContent = queja.id_comprador || 'N/A';
    document.getElementById('detalle-comprador-nombre').textContent = queja.nombre_comprador || 'N/A';
    document.getElementById('detalle-comprador-correo').textContent = queja.correo_comprador || 'N/A';
    
    // Info del vendedor
    document.getElementById('detalle-vendedor-id').textContent = queja.id_vendedor || 'N/A';
    document.getElementById('detalle-vendedor-nombre').textContent = queja.nombre_vendedor || 'N/A';
    document.getElementById('detalle-vendedor-correo').textContent = queja.correo_vendedor || 'N/A';
    
    // Info de pago
    document.getElementById('detalle-tipo-pago').textContent = queja.tipo_pago || 'No especificado';
    
    // Configurar botones de acción
    document.getElementById('btn-resolver-queja').onclick = () => actualizarEstadoQueja(idQueja, 'RESUELTA');
    document.getElementById('btn-desestimar-queja').onclick = () => actualizarEstadoQueja(idQueja, 'DESESTIMADA');
    document.getElementById('btn-banear-comprador').onclick = () => banearUsuario(queja.id_comprador, queja.nombre_comprador);
    document.getElementById('btn-banear-vendedor').onclick = () => banearUsuario(queja.id_vendedor, queja.nombre_vendedor);
    
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleQueja'));
    modal.show();
}

// Función para actualizar estado de queja
async function actualizarEstadoQueja(idQueja, nuevoEstado) {
    const token = localStorage.getItem('token');
    
    if (!confirm(`¿Confirmas marcar esta queja como ${nuevoEstado}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/queja-venta/${idQueja}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `estado_queja=${nuevoEstado}`
        });
        
        if (!response.ok) throw new Error('Error al actualizar queja');
        
        alert('Queja actualizada exitosamente');
        bootstrap.Modal.getInstance(document.getElementById('modalDetalleQueja')).hide();
        cargarQuejasVenta(); // Recargar tabla
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la queja');
    }
}

// Función para banear usuario
async function banearUsuario(idUsuario, nombreUsuario) {
    const token = localStorage.getItem('token');
    
    if (!confirm(`¿Estás seguro de BANEAR al usuario "${nombreUsuario}" (ID: ${idUsuario})?\n\nEsta acción puede ser reversible desde gestión de usuarios.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/usuario/${idUsuario}/banear`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al banear usuario');
        
        alert(`Usuario "${nombreUsuario}" ha sido baneado exitosamente`);
        bootstrap.Modal.getInstance(document.getElementById('modalDetalleQueja')).hide();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al banear el usuario. Puede que el endpoint no esté implementado aún.');
    }
}

// Función auxiliar para procesar imágenes base64
function procesarImagenBase64(img) {
    if (!img) return '';
    if (img.startsWith('data:image')) return img;
    return `data:image/jpeg;base64,${img}`;
}
