import { BASE_URL } from "./api_url.js";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificar sesión
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken"); // Necesitamos el token para el permiso

    if (!userId || !token) {
        alert("Debes iniciar sesión para ver tus notificaciones.");
        window.location.href = "login.html";
        return;
    }
    
    const contenedor = document.getElementById("contenedor-notificaciones");

    // 2. Función para obtener las notificaciones
    try {
        // CORRECCIÓN 1: La ruta en el backend es "/notificacion" (Singular), no "/notificaciones"
        const url = `${BASE_URL}notificacion/usuario/${userId}`;
        
        // CORRECCIÓN 2: Enviamos el token en los headers para que Main.java nos deje pasar
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token // Enviamos el token guardado en login
            }
        });

        if (!response.ok) {
            // Si falla, intentamos leer el mensaje de error del backend
            const errorMsg = await response.text();
            throw new Error(`Error ${response.status}: ${errorMsg || 'No se pudieron cargar las notificaciones'}`);
        }

        const notificaciones = await response.json();

        // 3. Limpiar contenedor
        contenedor.innerHTML = "";

        // 4. Validar si está vacío
        if (notificaciones.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary text-center" role="alert">
                    <h4 class="alert-heading">¡Todo limpio!</h4>
                    <p>No tienes notificaciones nuevas por el momento.</p>
                </div>
            `;
            return;
        }

        // 5. Renderizar
        notificaciones.forEach(notif => {
            const fechaObj = new Date(notif.fecha_envio);
            const fechaFormateada = fechaObj.toLocaleString('es-MX', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            const bgClass = notif.leida ? "bg-white" : "bg-light border-start border-primary border-4";
            const icono = obtenerIconoPorTipo(notif.tipo);
            const textoEstado = notif.leida ? '<span class="text-muted small">Leído</span>' : '<span class="badge bg-primary">Nuevo</span>';

            const cardHTML = `
                <div class="card mb-3 shadow-sm ${bgClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex align-items-center gap-3">
                                <div class="fs-2">${icono}</div>
                                <div>
                                    <h6 class="card-title mb-1 fw-bold">${notif.tipo}</h6>
                                    <p class="card-text text-dark mb-1">${notif.mensaje}</p>
                                    <small class="text-muted">📅 ${fechaFormateada}</small>
                                </div>
                            </div>
                            <div class="text-end">
                                ${textoEstado}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            contenedor.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error detallado:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                Ocurrió un error al cargar tus notificaciones.
                <br><small>${error.message}</small>
            </div>
        `;
    }
});

function obtenerIconoPorTipo(tipo) {
    switch (tipo ? tipo.toUpperCase() : "") {
        case 'VENTA': return '💰';
        case 'SEGURIDAD': return '🛡️';
        case 'SISTEMA': return '⚙️';
        default: return '🔔';
    }
}