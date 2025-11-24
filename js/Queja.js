let idioma = "es";

const textos = {
    es: {
        titulo: "Si tienes alguna queja o sugerencia puedes escribirlo en el siguiente apartado",
        descripcion: "Describe el problema...",
        placeholder: "Escribe tu problema aquí...",
        enviar: "Enviar",
        traducir: "Traducir a Inglés"
    },
    en: {
        titulo: "If you have any complaint or suggestion you can write it in the following section",
        descripcion: "Describe the issue...",
        placeholder: "Write your issue here...",
        enviar: "Send",
        traducir: "Translate to Spanish"
    }
};

document.getElementById("btnTranslate").addEventListener("click", () => {
    idioma = idioma === "es" ? "en" : "es";

    document.getElementById("txtTitulo").innerText = textos[idioma].titulo;
    document.getElementById("txtDescripcion").innerText = textos[idioma].descripcion;
    document.getElementById("txtArea").placeholder = textos[idioma].placeholder;
    document.getElementById("btnEnviar").innerHTML = textos[idioma].enviar + ' <i class="fa-solid fa-paper-plane ms-1"></i>';
    document.getElementById("btnTranslate").innerText = textos[idioma].traducir;
});

// MENSAJE EMERGENTE AL ENVIAR
document.getElementById("btnEnviar").addEventListener("click", () => {
    alert(idioma === "es" ? "¡Tu queja ha sido enviada correctamente!" : "Your complaint has been successfully sent!");
});
