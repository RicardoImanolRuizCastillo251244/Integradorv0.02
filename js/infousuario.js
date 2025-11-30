import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    const rol = localStorage.getItem("rol");
    const calificacion = document.getElementById("evaluacion");
    const infousuario = document.getElementById('contenedor-global');

    if (rol == 2) {
        calificacion.hidden = true;
    }

    if (!userId || !authToken) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    // Mostrar loader mientras carga
    mostrarLoader();

    try {
        // Fetch datos del usuario
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('Datos de usuario:', userData);

            // Poblar datos
            const nombre = userData.nombre_usuario || userData.username || 'Usuario';
            const correo = userData.correo_electronico || userData.email || userData.correo_usuario || userData.correo || 'correo@ejemplo.com';
            const iniciales = nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

            // Actualizar DOM
            infousuario.innerHTML = `
                <section class="perfil-container">
                    <div class="circle-iniciales" id="circleIniciales">${iniciales}</div>
                    <h3 id="nombreUsuario">${nombre}</h3>
                    <p id="correoUsuario">${correo}</p>
                </section>

                <section class="container mt-3 info-usuario">
                    <div class="campo-item">
                        <p class="titulo-campo">Nombre de usuario</p>
                        <p id="campoNombre">${nombre}</p>
                        <i class="fa-solid fa-pen-to-square icono-edit"
                            onclick="editarCampo('campoNombre', 'Nombre de usuario')"></i>
                    </div>

                    <div class="campo-item">
                        <p class="titulo-campo">Cambiar contraseña</p>
                        <p id="campoPass">●●●●●●</p>
                        <i class="fa-solid fa-pen-to-square icono-edit" onclick="editarCampo('campoPass', 'Contraseña')"></i>
                        <i class="fa-solid fa-eye icono-ver" onclick="togglePass()"></i>
                    </div>
                </section>

                <div class="container my-5">
                    <button id="logoutButton" class="btn btn-danger w-100">
                        <i class="fa-solid fa-right-from-bracket me-2"></i> Cerrar Sesión
                    </button>
                </div>
            `;

            //AGREGAR EVENT LISTENER DESPUÉS DE CREAR EL BOTÓN
            configurarLogout();

        } else {
            console.error('Error al obtener datos del usuario:', response.status);
            mostrarError('No se pudo cargar la información del usuario.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError('Error de conexión al cargar perfil.');
    }

    function mostrarLoader() {
        infousuario.innerHTML = `
            <div class="col-12 text-center" style="padding: 100px 0;">
                <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-4 text-muted fs-5">Cargando perfil...</p>
            </div>
        `;
    }

    function mostrarError(mensaje) {
        infousuario.innerHTML = `
            <div class="col-12 text-center" style="padding: 80px 20px;">
                <i class="fas fa-exclamation-triangle fa-4x text-danger mb-3"></i>
                <h3 class="text-danger">${mensaje}</h3>
                <button class="btn btn-primary mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Reintentar
                </button>
            </div>
        `;
    }
});

// ✅ FUNCIÓN SEPARADA PARA CONFIGURAR EL LOGOUT
function configurarLogout() {
    const logoutButton = document.getElementById("logoutButton");
    
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            console.log('Cerrando sesión...');
            
            // Limpiar localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('rol');
            
            
            window.location.href = './login.html';
        });
        
    } else {
        console.error('No se encontró el botón de logout');
    }
}

// Funciones globales para los onclick del HTML
window.editarCampo = function (idCampo, nombreCampo) {
    const campoElemento = document.getElementById(idCampo);
    const valorActual = campoElemento.textContent;
    
    const nuevoValor = prompt(`Editar ${nombreCampo}:`, 
        valorActual === '●●●●●●' ? '' : valorActual);
    
    if (nuevoValor !== null && nuevoValor.trim() !== '') {
        if (idCampo === 'campoPass') {
            // Aquí deberías hacer una petición al backend para cambiar la contraseña
            console.log('Cambiar contraseña a:', nuevoValor);
            alert('Funcionalidad de cambio de contraseña en desarrollo');
        } else {
            campoElemento.textContent = nuevoValor;
            // Aquí deberías hacer una petición al backend para actualizar el nombre
            console.log('Actualizar nombre a:', nuevoValor);
        }
    }
};

window.togglePass = function () {
    const campoPass = document.getElementById('campoPass');
    const iconoVer = document.querySelector('.icono-ver');
    
    if (campoPass.textContent === '●●●●●●') {
        campoPass.textContent = '********'; 
        iconoVer.classList.remove('fa-eye');
        iconoVer.classList.add('fa-eye-slash');
    } else {
        campoPass.textContent = '●●●●●●';
        iconoVer.classList.remove('fa-eye-slash');
        iconoVer.classList.add('fa-eye');
    }
};

// Botón regresar
const returnButton = document.getElementById("return");
if (returnButton) {
    returnButton.addEventListener("click", () => {
        window.location.href = '../index.html';
    });
}