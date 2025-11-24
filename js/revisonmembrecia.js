document.querySelectorAll(".tabs-usuario .tab").forEach((tab, index) => {
    tab.addEventListener("click", () => {
        if (index === 0) window.location.href = "infousuario.html";
        if (index === 1) window.location.href = "pagomenbre.html";
        if (index === 2) window.location.href = "compraconcretadas.html";
        if (index === 3) window.location.href = "estadisticas.html";
    });
});

// Función para abrir modal con la imagen
function abrirModal(src) {
    document.getElementById('imagenAmpliada').src = src;
    var modal = new bootstrap.Modal(document.getElementById('modalImagen'));
    modal.show();
}
