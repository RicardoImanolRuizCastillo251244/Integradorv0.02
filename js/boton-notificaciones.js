// Componente del Botón de Notificaciones para el Administrador
import { BASE_URL } from "./api_url.js";

let contadorNoLeidas = 0;
let intervalId = null;

// Inicializar el botón de notificaciones
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('boton-notificaciones-container');

    if (container) {
        renderizarBotonNotificaciones(container);
        cargarContadorNotificaciones();

        // Actualizar cada 30 segundos
        intervalId = setInterval(cargarContadorNotificaciones, 30000);
    }
});

// Renderizar el botón de notificaciones
function renderizarBotonNotificaciones(container) {
    container.innerHTML = `
        <button type="button" class="btn border-0 bg-transparent position-relative me-2"
                onclick="navegarANotificaciones()"
                id="btn-notificaciones"
                title="Centro de Alertas"
                style="padding: 0.5rem;">
            <i class="fa-solid fa-bell" style="font-size: 26px; color: #ffffff;"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  id="badge-notificaciones"
                  style="display: none; font-size: 10px;">
                0
            </span>
        </button>
    `;
}

// Cargar el contador de notificaciones no leídas
async function cargarContadorNotificaciones() {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!authToken || !userId) return;

    try {
        const response = await fetch(BASE_URL + `notificacion/usuario/${userId}`, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const notificaciones = await response.json();

            // Contar solo las no leídas de tipo QUEJA_VENTA o QUEJA_USUARIO
            const alertasSeguridad = notificaciones.filter(n =>
                !n.leida && (n.tipo === 'QUEJA_VENTA' || n.tipo === 'QUEJA_USUARIO')
            );

            contadorNoLeidas = alertasSeguridad.length;
            actualizarBadge();
        }
    } catch (error) {
        console.error('Error al cargar contador de notificaciones:', error);
    }
}

// Actualizar el badge del contador
function actualizarBadge() {
    const badge = document.getElementById('badge-notificaciones');
    const btnIcon = document.querySelector('#btn-notificaciones i');

    if (badge) {
        if (contadorNoLeidas > 0) {
            badge.textContent = contadorNoLeidas > 99 ? '99+' : contadorNoLeidas;
            badge.style.display = 'inline-block';

            // Animación de alerta en el icono
            if (btnIcon) {
                btnIcon.classList.add('fa-shake');
                btnIcon.style.color = '#ffffff'; // Blanco para alertas
            }
        } else {
            badge.style.display = 'none';
            if (btnIcon) {
                btnIcon.classList.remove('fa-shake');
                btnIcon.style.color = '#ffffff'; // Color blanco normal
            }
        }
    }
}

// Navegar a la página de notificaciones
window.navegarANotificaciones = () => {
    // Limpiar el intervalo al navegar
    if (intervalId) {
        clearInterval(intervalId);
    }
    window.location.href = 'notificaciones-admin.html';
};

// Limpiar intervalo al salir de la página
window.addEventListener('beforeunload', () => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
