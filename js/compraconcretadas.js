function mostrarTabla(tipo) {
    document.getElementById("tabla-proceso").classList.toggle("d-none", tipo !== "proceso");
    document.getElementById("tabla-concretadas").classList.toggle("d-none", tipo !== "concretadas");

    const subtabs = document.querySelectorAll(".subtab");
    subtabs.forEach(btn => btn.classList.remove("active"));

    if (tipo === "proceso") {
        subtabs[0].classList.add("active");
    } else {
        subtabs[1].classList.add("active");
    }

    document.querySelectorAll(".tabs-usuario .tab").forEach((tab, index) => {
        tab.addEventListener("click", () => {
            if (index === 0) window.location.href = "infousuario.html";
            if (index === 1) window.location.href = "pagomenbre.html";
            if (index === 2) window.location.href = "compraconcretadas.html";
            if (index === 2) window.location.href = "revisonmembrecia.html";


            if (index === 3) window.location.href = "estadistica.html";
        });
    });

}
