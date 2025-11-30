import { BASE_URL } from "./api_url.js";
document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    const rol = localStorage.getItem("rol")
    const calificacion = document.getElementById("evaluacion")

    if(rol == 2){
        calificacion.hidden = true
    }


    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem("rol")

        console.log("Sesión cerrada. Token, rol y UserId eliminados.");

        window.location.href = './pages/login.html'; 
    }

    //función accesible globalmente (si el botón usa onclick="logout()")
    window.logout = logout;

    if (!userId || !authToken) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    // Elementos del DOM
    const circleIniciales = document.getElementById('circleIniciales');
    const nombreUsuario = document.getElementById('nombreUsuario');
    const correoUsuario = document.getElementById('correoUsuario');
    const campoNombre = document.getElementById('campoNombre');
    const campoPass = document.getElementById('campoPass');

    try {
        // Fetch datos del usuario
        // Asumimos que el endpoint es /usuario/{id}
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            headers: {
                'Authorization': authToken // Enviar token si es necesario
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('Datos de usuario:', userData);

            // Poblar datos
            // Ajustar nombres de propiedades según respuesta real de la API
            const nombre = userData.nombre_usuario || userData.username || 'Usuario';
            const correo = userData.correo_electronico || userData.email || userData.correo_usuario || userData.correo || 'correo@ejemplo.com';

            // Actualizar DOM
            nombreUsuario.textContent = nombre;
            campoNombre.textContent = nombre;
            correoUsuario.textContent = correo;

            // Iniciales
            const iniciales = nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            circleIniciales.textContent = iniciales;

        } else {
            console.error('Error al obtener datos del usuario:', response.status);
            alert('No se pudo cargar la información del usuario.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Error de conexión al cargar perfil.');
    }
});

// Funciones globales para los onlick del HTML
window.editarCampo = function (idCampo, nombreCampo) {
    // Lógica para editar campo (por implementar)
    alert(`Editar ${nombreCampo} (Funcionalidad en desarrollo)`);
};

window.togglePass = function () {
    const campoPass = document.getElementById('campoPass');
    if (campoPass.textContent === '●●●●●●') {
        campoPass.textContent = '********'; // O mostrar contraseña real si la tuviéramos
    } else {
        campoPass.textContent = '●●●●●●';
    }
};

const logout = document.getElementById("logoutButton")

logout.addEventListener("click", () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem("rol")
    window.location.href = "./login.html"
})

const returnFunction = document.getElementById("return")
returnFunction.addEventListener("click", ()=>{
    window.location.href = '../index.html'; 
})