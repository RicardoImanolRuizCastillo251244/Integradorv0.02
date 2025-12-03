import { BASE_URL } from "./api_url.js";

let notificaciones = [];
let filtroActual = 'todas';

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    await cargarNotificaciones();
});

async function cargarNotificaciones() {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(BASE_URL + `notificaciones/usuario/${userId}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            notificaciones = await response.json();
            renderizarNotificaciones();
        } else {
            console.error('Error al cargar notificaciones:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    }
}

function renderizarNotificaciones() {
    const lista = document.getElementById('listaNotificaciones');
    lista.innerHTML = '';

    let notificacionesFiltradas = notificaciones;

    // Aplicar filtro
    if (filtroActual === 'nuevas') {
        notificacionesFiltradas = notificaciones.filter(n => !n.leida);
    } else if (filtroActual === 'leidas') {
        notificacionesFiltradas = notificaciones.filter(n => n.leida);
    }

    if (notificacionesFiltradas.length === 0) {
        lista.innerHTML = '<div class="notificacion-item"><p class="text-center text-muted">No hay notificaciones.</p></div>';
        return;
    }

    notificacionesFiltradas.forEach(n => {
        const item = document.createElement('div');
        item.className = `notificacion-item ${!n.leida ? 'no-leida' : ''}`;
        
        const fecha = new Date(n.fecha_creacion || n.fecha);
        const fechaFormato = fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Icono según tipo
        let icono = 'fa-bell';
        let colorIcono = '#fc4b08';
        
        if (n.tipo === 'queja' || n.tipo === 'alerta') {
            icono = 'fa-exclamation-triangle';
            colorIcono = '#c00000';
        } else if (n.tipo === 'membresia' || n.tipo === 'compra') {
            icono = 'fa-crown';
            colorIcono = '#FFD700';
        } else if (n.tipo === 'producto') {
            icono = 'fa-box';
            colorIcono = '#4d9d30';
        }

        item.innerHTML = `
            <div class="notificacion-header">
                <div class="notificacion-icono" style="background: ${colorIcono};">
                    <i class="fa-solid ${icono}"></i>
                </div>
                <div class="notificacion-info">
                    <p class="notificacion-titulo">${n.titulo || 'Notificación'}</p>
                    <p class="notificacion-fecha">${fechaFormato}</p>
                </div>
                ${!n.leida ? '<span class="badge-nuevo">Nuevo</span>' : ''}
            </div>
            <div class="notificacion-cuerpo">
                <p class="notificacion-mensaje">${n.mensaje || n.descripcion || 'Sin mensaje'}</p>
            </div>
            <div class="notificacion-acciones">
                ${!n.leida ? 
                    `<button class="btn-marcar-leida" onclick="marcarLeida(${n.id_notificacion || n.id})">
                        <i class="fa-solid fa-check"></i> Marcar como leída
                    </button>` : 
                    '<span class="texto-leida"><i class="fa-solid fa-check"></i> Leída</span>'
                }
                <button class="btn-eliminar-notif" onclick="eliminarNotificacion(${n.id_notificacion || n.id})">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>
        `;

        lista.appendChild(item);
    });
}

window.filtrarNotificaciones = (filtro) => {
    filtroActual = filtro;
    
    // Actualizar botones activos
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderizarNotificaciones();
};

window.marcarLeida = async (idNotificacion) => {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + `notificaciones/${idNotificacion}/leer`, {
            method: 'PATCH',
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            // Actualizar localmente
            const notif = notificaciones.find(n => (n.id_notificacion || n.id) === idNotificacion);
            if (notif) notif.leida = true;
            renderizarNotificaciones();
        } else {
            alert('Error al marcar como leída.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

window.marcarTodasLeidas = async () => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(BASE_URL + `notificaciones/usuario/${userId}/marcar-todas-leidas`, {
            method: 'PATCH',
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            notificaciones.forEach(n => n.leida = true);
            renderizarNotificaciones();
            alert('Todas las notificaciones marcadas como leídas.');
        } else {
            alert('Error al marcar todas como leídas.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

window.eliminarNotificacion = async (idNotificacion) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
        return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + `notificaciones/${idNotificacion}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            notificaciones = notificaciones.filter(n => (n.id_notificacion || n.id) !== idNotificacion);
            renderizarNotificaciones();
        } else {
            alert('Error al eliminar notificación.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

function mostrarError() {
    const lista = document.getElementById('listaNotificaciones');
    lista.innerHTML = '<div class="notificacion-item"><p class="text-center text-danger">Error al cargar notificaciones.</p></div>';
}
