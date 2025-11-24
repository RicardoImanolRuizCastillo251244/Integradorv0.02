document.querySelectorAll(".tabs-usuario .tab").forEach((tab, index) => {
    tab.addEventListener("click", () => {
        if (index === 0) window.location.href = "infousuario.html";
        if (index === 1) window.location.href = "pagomenbre.html";
        if (index === 2) window.location.href = "compraconcretadas.html";
        if (index === 3) window.location.href = "estadisticas.html";
    });
});
