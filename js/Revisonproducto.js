// Función para abrir modal con la imagen
function abrirModal(src) {
    document.getElementById('imagenAmpliada').src = src;
    var modal = new bootstrap.Modal(document.getElementById('modalImagen'));
    modal.show();
}

// Función para aceptar publicación
function aceptarPublicacion(boton) {
    const fila = boton.closest('tr');
    const titulo = fila.querySelector('td:nth-child(3)').textContent;

    if (confirm(`¿Estás seguro de aceptar la publicación "${titulo}"?`)) {
        fila.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            fila.remove();
        }, 1000);
    }
}

// Función para declinar publicación
function declinarPublicacion(boton) {
    const fila = boton.closest('tr');
    const titulo = fila.querySelector('td:nth-child(3)').textContent;

    if (confirm(`¿Estás seguro de declinar la publicación "${titulo}"?`)) {
        fila.style.backgroundColor = '#f8d7da';
        setTimeout(() => {
            fila.remove();
        }, 1000);
    }
}
