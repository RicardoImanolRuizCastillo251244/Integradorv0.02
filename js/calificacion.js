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

// Enviar calificación
function enviarCalificacion() {
    if (calificacionSeleccionada === 0) {
        alert('Por favor selecciona una calificación con estrellas');
        return;
    }

    const comentario = document.getElementById('comentario').value;

    // Aquí puedes hacer una petición al servidor para guardar la calificación
    console.log('Calificación:', calificacionSeleccionada);
    console.log('Comentario:', comentario);

    // Mostrar modal de éxito
    const modal = new bootstrap.Modal(document.getElementById('modalExito'));
    modal.show();

    // Opcional: resetear el formulario después de 3 segundos
    setTimeout(() => {
        calificacionSeleccionada = 0;
        pintarEstrellas(0);
        document.getElementById('comentario').value = '';
    }, 3000);
}
