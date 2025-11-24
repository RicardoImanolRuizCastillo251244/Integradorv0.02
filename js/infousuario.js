// INICIALES AUTOMÁTICAS
document.addEventListener("DOMContentLoaded", () => {
    actualizarIniciales();
});

function actualizarIniciales() {
    const nombre = document.getElementById("nombreUsuario").innerText;
    const iniciales = nombre.split(" ").map(n => n[0]).join("").toUpperCase();
    document.getElementById("circleIniciales").innerText = iniciales;
}

// FUNCIÓN PARA EDITAR NOMBRE Y CONTRASEÑA
function editarCampo(idCampo, titulo) {
    const campo = document.getElementById(idCampo);
    const valorActual = campo.innerText.replace(/●/g, "");
    const nuevoValor = prompt(``, valorActual);

    if (nuevoValor !== null && nuevoValor.trim() !== "") {

        if (idCampo === "campoPass") {
            campo.innerText = "●".repeat(nuevoValor.length);
        } else {
            campo.innerText = nuevoValor;
            document.getElementById("nombreUsuario").innerText = nuevoValor;
            actualizarIniciales();
        }

        alert("$usuario actualizado correctamente");
    }
}

// MOSTRAR / OCULTAR CONTRASEÑA
let passVisible = false;

function togglePass() {
    const campo = document.getElementById("campoPass");

    if (!passVisible) {
        campo.innerText = "contraseña_real";
        passVisible = true;
    } else {
        campo.innerText = "●".repeat(campo.innerText.length);
        passVisible = false;
    }
}

// NAVEGACIÓN ENTRE PESTAÑAS
document.querySelectorAll(".tabs-usuario .tab").forEach((tab, index) => {
    tab.addEventListener("click", () => {
        if (index === 0) window.location.href = "infousuario.html";
        if (index === 1) window.location.href = "pagomenbre.html";
        if (index === 2) window.location.href = "compraconcretadas.html";
        if (index === 3) window.location.href = "estadistica.html";
        if (index === 4) window.location.href = "calificacion.html";
    });
});
