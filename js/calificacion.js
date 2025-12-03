// Sistema de calificación con estrellas
let calificacionSeleccionada = 0;
const estrellas = document.querySelectorAll('.estrellas i');

estrellas.forEach((estrella, index) => {
    // Al hacer hover
    estrella.addEventListener('mouseenter', () => {
        pintarEstrellas(index + 1);
    });

    // Al hacer click
    estrella.addEventListener('click', () => {
        calificacionSeleccionada = index + 1;
        pintarEstrellas(calificacionSeleccionada);
    });
});

// Al salir del área de estrellas, mantener la selección
document.getElementById('estrellas').addEventListener('mouseleave', () => {
    pintarEstrellas(calificacionSeleccionada);
});

function pintarEstrellas(cantidad) {
    estrellas.forEach((estrella, index) => {
        if (index < cantidad) {
            estrella.classList.add('active');
        } else {
            estrella.classList.remove('active');
        }
    });
}

// Importar BASE_URL
import { BASE_URL } from "./api_url.js";

// Función para obtener el ID de la publicación desde la URL
function obtenerIdPublicacionDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id_publicacion');
}

// Enviar calificación
async function enviarCalificacion() {
    if (calificacionSeleccionada === 0) {
        alert('Por favor selecciona una calificación con estrellas');
        return;
    }

    const comentario = document.getElementById('comentario').value.trim();
    const idPublicacion = obtenerIdPublicacionDeURL();
    const idUsuario = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!idPublicacion) {
        alert('No se pudo identificar la publicación');
        return;
    }

    if (!idUsuario || !authToken) {
        alert('Debes iniciar sesión para calificar');
        window.location.href = '/pages/login.html';
        return;
    }

    try {
        const response = await fetch(BASE_URL + 'calificacion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_publicacion: parseInt(idPublicacion),
                id_usuario: parseInt(idUsuario),
                calificacion: calificacionSeleccionada,
                comentario: comentario || null
            })
        });

        if (response.ok) {
            console.log('Calificación enviada exitosamente');
            
            // Mostrar modal de éxito
            const modal = new bootstrap.Modal(document.getElementById('modalExito'));
            modal.show();

            // Resetear el formulario después de 3 segundos
            setTimeout(() => {
                calificacionSeleccionada = 0;
                pintarEstrellas(0);
                document.getElementById('comentario').value = '';
            }, 3000);
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.message || 'Error al enviar la calificación';
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al enviar la calificación');
    }
}
