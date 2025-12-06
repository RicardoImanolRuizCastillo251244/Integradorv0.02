import { BASE_URL } from "./api_url.js";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Validar Sesión
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    if (!userId || !token) {
        alert("Debes iniciar sesión para ver tus notificaciones.");
        window.location.href = "login.html";
        return;
    }
    
    const contenedor = document.getElementById("contenedor-notificaciones");

    // 2. Obtener notificaciones
    try {
        const url = `${BASE_URL}notificacion/usuario/${userId}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const notificaciones = await response.json();

        // 3. Limpiar y validar
        contenedor.innerHTML = "";
        if (notificaciones.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary text-center py-4" role="alert">
                    <h4 class="alert-heading h5">¡Todo limpio!</h4>
                    <p class="mb-0">No tienes notificaciones por el momento.</p>
                </div>
            `;
            return;
        }

        // 4. Renderizar (Creando elementos DOM para manejar el click)
        notificaciones.forEach(notif => {
            const card = crearTarjetaNotificacion(notif, token);
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                No se pudieron cargar las notificaciones.
            </div>
        `;
    }
});

/**
 * Crea el elemento HTML de la tarjeta y le asigna el evento de click
 */
function crearTarjetaNotificacion(notif, token) {
    // A. Resolver problema de Fecha Invalid Date
    const fechaFormateada = formatearFechaJava(notif.fecha_envio);

    // B. Definir estilos
    // Si no está leída, usamos fondo claro y borde azul. Si ya está leída, fondo blanco simple.
    const claseNoLeida = !notif.leida ? "bg-light border-start border-primary border-4" : "bg-white";
    const icono = obtenerIconoPorTipo(notif.tipo);
    
    // Crear el DIV principal
    const cardDiv = document.createElement('div');
    cardDiv.className = `card mb-3 shadow-sm cursor-pointer ${claseNoLeida}`;
    cardDiv.style.cursor = "pointer"; // Manita al pasar el mouse
    cardDiv.style.transition = "all 0.2s ease";

    // Contenido HTML interno
    cardDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-center gap-3">
                    <div class="fs-2"></div>
                    <div>
                        <h6 class="card-title mb-1 fw-bold text-uppercase" style="font-size: 0.9rem;">${notif.tipo}</h6>
                        <p class="card-text text-dark mb-1">${notif.mensaje}</p>
                        <small class="text-muted"> ${fechaFormateada}</small>
                    </div>
                </div>
                <div class="estado-indicador">
                    ${!notif.leida ? '<span class="badge bg-primary rounded-pill">Nueva</span>' : '<i class="fa-solid fa-check-double text-muted"></i>'}
                </div>
            </div>
        </div>
    `;

    // C. Evento Click: Marcar como leída
    cardDiv.addEventListener('click', async () => {
        // Solo llamar a la API si NO está leída
        if (!notif.leida) {
            try {
                // 1. Cambio visual inmediato (para que se sienta rápido)
                cardDiv.classList.remove("bg-light", "border-start", "border-primary", "border-4");
                cardDiv.classList.add("bg-white");
                const badge = cardDiv.querySelector(".estado-indicador");
                if(badge) badge.innerHTML = '<i class="fa-solid fa-check-double text-muted"></i>';
                
                // 2. Llamada a la API en segundo plano
                // Ruta: PUT /notificacion/{id}/leer
                const urlLeer = `${BASE_URL}notificacion/${notif.id}/leer`;
                await fetch(urlLeer, {
                    method: 'PUT',
                    headers: {
                        'Authorization': token
                    }
                });
                
                // Actualizamos el objeto local para evitar múltiples clicks
                notif.leida = true;

            } catch (error) {
                console.error("Error al marcar como leída", error);
                // Si falla, podrías revertir los estilos aquí si quisieras
            }
        }
    });

    return cardDiv;
}

/**
 * Convierte el formato de fecha de Java (Array o String ISO) a formato legible
 */
function formatearFechaJava(fechaInput) {
    if (!fechaInput) return "Fecha desconocida";

    let fechaObj;

    // Caso 1: Java envía Array [2024, 12, 5, 14, 30, ...]
    if (Array.isArray(fechaInput)) {
        // new Date(año, mes-1, dia, hora, min, seg)
        // ¡OJO! En JS los meses van de 0 (Enero) a 11 (Diciembre), Java los manda de 1 a 12.
        const anio = fechaInput[0];
        const mes = fechaInput[1] - 1; 
        const dia = fechaInput[2];
        const hora = fechaInput[3] || 0;
        const min = fechaInput[4] || 0;
        fechaObj = new Date(anio, mes, dia, hora, min);
    } 
    // Caso 2: Java envía String ISO "2024-12-05T14:30:00"
    else {
        fechaObj = new Date(fechaInput);
    }

    if (isNaN(fechaObj.getTime())) return "Fecha inválida";

    // Retornar formato bonito: "05 dic, 02:30 PM"
    return fechaObj.toLocaleString('es-MX', {
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    });
}

function obtenerIconoPorTipo(tipo) {
    switch (tipo ? tipo.toUpperCase() : "") {
        case 'VENTA': return '💰';
        case 'SEGURIDAD': return '🛡️';
        case 'SISTEMA': return '⚙️';
        default: return '🔔';
    }
}