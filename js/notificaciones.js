import { BASE_URL } from "./api_url.js";

let notificaciones = [];

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!authToken || !userId) {
        window.location.href = './login.html';
        return;
    }

    await cargarNotificaciones();
});

async function cargarNotificaciones() {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + `notificacion/usuario/${userId}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            notificaciones = await response.json();
            console.log('Notificaciones cargadas:', notificaciones);
            renderizarNotificaciones();
        } else {
            console.error('Error al cargar notificaciones:', response.status);
            mostrarMensajeVacio();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensajeVacio();
    }
}

function renderizarNotificaciones() {
    const contenedor = document.querySelector('.contenedor-notificaciones');
    
    if (!contenedor) {
        console.error('No se encontró el contenedor de notificaciones');
        return;
    }

    // Limpiar contenido hardcodeado
    contenedor.innerHTML = '';

    if (notificaciones.length === 0) {
        contenedor.innerHTML = `
            <div class="notificacion-card">
                <p class="text-center text-muted" style="padding: 2rem;">No tienes notificaciones</p>
            </div>
        `;
        return;
    }

    // Ordenar por fecha más reciente
    notificaciones.sort((a, b) => {
        const fechaA = new Date(a.fecha_envio || a.fecha_creacion || 0);
        const fechaB = new Date(b.fecha_envio || b.fecha_creacion || 0);
        return fechaB - fechaA;
    });

    notificaciones.forEach(notif => {
        const card = document.createElement('div');
        card.className = 'notificacion-card';
        if (!notif.leida) {
            card.style.borderLeft = '4px solid #ff6b35';
        }

        // Determinar ícono según tipo
        let icono = 'fa-bell';
        if (notif.tipo === 'VENTA') {
            icono = 'fa-shopping-cart';
        } else if (notif.tipo === 'MENSAJE') {
            icono = 'fa-envelope';
        } else if (notif.tipo === 'SISTEMA') {
            icono = 'fa-info-circle';
        } else if (notif.tipo === 'ALERTA') {
            icono = 'fa-exclamation-triangle';
        }

        // Calcular tiempo transcurrido
        const tiempoTranscurrido = calcularTiempoTranscurrido(notif.fecha_envio || notif.fecha_creacion);

        card.innerHTML = `
            <h2 class="notificacion-titulo">${notif.tipo || 'Notificación'}</h2>

            <div class="notificacion-avatar">
                <div class="avatar-notif">
                    <i class="fa-solid ${icono}"></i>
                </div>
            </div>

            <p class="notificacion-descripcion">${notif.mensaje}</p>

            <div class="notificacion-fecha">
                ${tiempoTranscurrido}
            </div>

            ${!notif.leida ? '<div style="position: absolute; top: 10px; right: 10px; width: 10px; height: 10px; background: #ff6b35; border-radius: 50%;"></div>' : ''}
        `;

        // Marcar como leída al hacer clic
        card.addEventListener('click', () => marcarComoLeida(notif.id || notif.id_notificacion));

        contenedor.appendChild(card);
    });
}

function mostrarMensajeVacio() {
    const contenedor = document.querySelector('.contenedor-notificaciones');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="notificacion-card">
                <p class="text-center text-muted" style="padding: 2rem;">No se pudieron cargar las notificaciones</p>
            </div>
        `;
    }
}

async function marcarComoLeida(idNotificacion) {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + `notificacion/${idNotificacion}/leer`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            console.log('Notificación marcada como leída');
            await cargarNotificaciones(); // Recargar para actualizar visualmente
        }
    } catch (error) {
        console.error('Error al marcar como leída:', error);
    }
}

function calcularTiempoTranscurrido(fechaCreacion) {
    if (!fechaCreacion) return 'Recién enviada';

    try {
        let fecha;
        
        // Si la fecha es un array [año, mes, día, hora, minuto, segundo]
        if (Array.isArray(fechaCreacion)) {
            fecha = new Date(
                fechaCreacion[0],           // año
                fechaCreacion[1] - 1,       // mes (0-indexado)
                fechaCreacion[2],           // día
                fechaCreacion[3] || 0,      // hora
                fechaCreacion[4] || 0,      // minuto
                fechaCreacion[5] || 0       // segundo
            );
        } else {
            // Si es un string, parsearlo normalmente
            fecha = new Date(fechaCreacion);
        }
        
        // Verificar si la fecha es válida
        if (isNaN(fecha.getTime())) {
            return 'Recién enviada';
        }
        
        const ahora = new Date();
        const diferencia = ahora - fecha;

        const minutos = Math.floor(diferencia / 60000);
        const horas = Math.floor(diferencia / 3600000);
        const dias = Math.floor(diferencia / 86400000);

        if (minutos < 1) return 'Ahora';
        if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
        if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
        if (dias === 1) return 'Ayer';
        if (dias < 7) return `Hace ${dias} días`;
        
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (error) {
        console.error('Error al calcular tiempo:', error);
        return 'Recién enviada';
    }
}
