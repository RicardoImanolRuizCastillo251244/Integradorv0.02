import { BASE_URL } from "./api_url.js";

// Variable global para almacenar los datos del usuario
let usuarioActual = null;
let passwordVisible = false;

document.addEventListener('DOMContentLoaded', async () => {
    const infousuario = document.getElementById('contenedor-global');
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    const rol = localStorage.getItem("rol");
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
            usuarioActual = await response.json();
            console.log('Datos de usuario:', usuarioActual);

            // Poblar datos
            const nombre = usuarioActual.nombre_usuario || usuarioActual.username || 'Usuario';
            const correo = usuarioActual.correo_electronico || usuarioActual.email || usuarioActual.correo_usuario || usuarioActual.correo || 'correo@ejemplo.com';
            const numeroCuenta = usuarioActual.numero_cuenta || 'No registrado';
            const titularCuenta = usuarioActual.titular_usuario || 'No registrado';
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
                            onclick="editarCampo('nombre', 'Nombre de usuario')"></i>
                    </div>

                    <div class="campo-item">
                        <p class="titulo-campo">Cambiar contraseña</p>
                        <p id="campoPass">●●●●●●</p>
                        <i class="fa-solid fa-pen-to-square icono-edit" onclick="editarCampo('password', 'Contraseña')"></i>
                        <i class="fa-solid fa-eye icono-ver" onclick="togglePass()"></i>
                    </div>

                    <div class="campo-item" id="containerNumCuenta">
                        <p class="titulo-campo">Número de cuenta</p>
                        <p id="campoNumCuenta">${numeroCuenta}</p>
                        <i class="fa-solid fa-pen-to-square icono-edit" onclick="editarCampo('numero_cuenta', 'Número de cuenta')"></i>
                    </div>

                    <div class="campo-item" id="containerTitular">
                        <p class="titulo-campo">Titular de cuenta</p>
                        <p id="campoTitular">${titularCuenta}</p>
                        <i class="fa-solid fa-pen-to-square icono-edit" onclick="editarCampo('titular', 'Titular de cuenta')"></i>
                    </div>

                    <div class="col-12 d-flex justify-content-center mt-4 mb-4" id="containerPublicar">
                    <button type="button" id="buttonPost" class="btn-publicar pb-2 pt-2">VENDER
                        <img class="img-btn-publicar mb-1" src="/images/editar.png" alt="">
                    </button>
                    </div>

                </section>

                <div class="container my-5">
                    <button id="logoutButton" class="btn btn-danger w-100">
                        <i class="fa-solid fa-right-from-bracket me-2"></i> Cerrar Sesión
                    </button>
                </div>
            `;

            
            // Configurar visibilidad según rol
            const membresia = document.getElementById('membresia');
            const estadisticas = document.getElementById('estadisticas');
            const containerNumCuenta = document.getElementById('containerNumCuenta');
            const containerTitular = document.getElementById('containerTitular');
            const containerPublicar = document.getElementById('containerPublicar');

            if (rol == 1) {
                // Usuario consumidor
                if (membresia) membresia.style.display = 'none';
                if (estadisticas) estadisticas.style.display = 'none';
                if (containerNumCuenta) containerNumCuenta.style.display = 'none';
                if (containerTitular) containerTitular.style.display = 'none';
            } else {
                // Usuario vendedor
                if (containerPublicar) containerPublicar.style.display = 'none';
            }
            
            configurarLogout();

        } else {
            console.error('Error al obtener datos del usuario:', response.status);
            mostrarError('No se pudo cargar la información del usuario.');
        }
        
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError('Error de conexión al cargar perfil.');
    }

    if (!userId || !authToken) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'login.html';
        return;
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
window.editarCampo = async function (tipoCampo, nombreCampo) {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    let nuevoValor;
    
    if (tipoCampo === 'password') {
        // Para contraseña, usar un prompt más seguro
        nuevoValor = prompt(`Ingresa tu nueva ${nombreCampo}:`);
        
        if (nuevoValor === null || nuevoValor.trim() === '') {
            return; // Usuario canceló o no ingresó nada
        }
        
        if (nuevoValor.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        
        // Confirmar contraseña
        const confirmacion = prompt('Confirma tu nueva contraseña:');
        if (confirmacion !== nuevoValor) {
            alert('Las contraseñas no coinciden.');
            return;
        }
    } else {
        // Para otros campos
        let valorActual = '';
        if (tipoCampo === 'nombre') {
            valorActual = document.getElementById('campoNombre').textContent;
        } else if (tipoCampo === 'numero_cuenta') {
            valorActual = document.getElementById('campoNumCuenta').textContent;
            if (valorActual === 'No registrado') valorActual = '';
        } else if (tipoCampo === 'titular') {
            valorActual = document.getElementById('campoTitular').textContent;
            if (valorActual === 'No registrado') valorActual = '';
        }
        
        nuevoValor = prompt(`Editar ${nombreCampo}:`, valorActual);
        
        if (nuevoValor === null || nuevoValor.trim() === '') {
            return;
        }
    }
    
    try {
        // Preparar datos para actualización
        let datosActualizacion = {};
        
        if (tipoCampo === 'nombre') {
            datosActualizacion.nombre_usuario = nuevoValor;
        } else if (tipoCampo === 'password') {
            datosActualizacion.contrasena = nuevoValor;
        } else if (tipoCampo === 'numero_cuenta') {
            datosActualizacion.numero_cuenta = nuevoValor;
        } else if (tipoCampo === 'titular') {
            datosActualizacion.titular_usuario = nuevoValor;
        }
        
        // Hacer petición PUT al backend
        const response = await fetch(`${BASE_URL}usuario`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
                'User-Id': userId
            },
            body: JSON.stringify(datosActualizacion)
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(data.message || 'Actualización exitosa');
            
            // Actualizar la vista
            if (tipoCampo === 'nombre') {
                document.getElementById('campoNombre').textContent = nuevoValor;
                document.getElementById('nombreUsuario').textContent = nuevoValor;
                const iniciales = nuevoValor.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                document.getElementById('circleIniciales').textContent = iniciales;
                if (usuarioActual) usuarioActual.nombre_usuario = nuevoValor;
            } else if (tipoCampo === 'password') {
                alert('Contraseña actualizada correctamente. Se recomienda cerrar sesión y volver a iniciar.');
                // Ocultar la contraseña si estaba visible
                passwordVisible = false;
                document.getElementById('campoPass').textContent = '●●●●●●';
                const iconoVer = document.querySelector('.icono-ver');
                iconoVer.classList.remove('fa-eye-slash');
                iconoVer.classList.add('fa-eye');
            } else if (tipoCampo === 'numero_cuenta') {
                document.getElementById('campoNumCuenta').textContent = nuevoValor;
                if (usuarioActual) usuarioActual.numero_cuenta = nuevoValor;
            } else if (tipoCampo === 'titular') {
                document.getElementById('campoTitular').textContent = nuevoValor;
                if (usuarioActual) usuarioActual.titular_usuario = nuevoValor;
            }
        } else {
            const errorMsg = await response.text();
            throw new Error(errorMsg || 'Error al actualizar');
        }
        
    } catch (error) {
        console.error('Error en actualización:', error);
        alert('Error al actualizar: ' + error.message);
    }
};

window.togglePass = async function () {
    const campoPass = document.getElementById('campoPass');
    const iconoVer = document.querySelector('.icono-ver');
    
    // Simplemente alternar entre ocultar y mostrar asteriscos
    // No podemos mostrar la contraseña real porque está hasheada en el servidor
    if (!passwordVisible) {
        // Mostrar asteriscos en lugar de puntos
        campoPass.textContent = '••••••••';
        passwordVisible = true;
        iconoVer.classList.remove('fa-eye');
        iconoVer.classList.add('fa-eye-slash');
        
        // Mostrar mensaje informativo
        campoPass.style.letterSpacing = '2px';
    } else {
        // Ocultar contraseña
        campoPass.textContent = '●●●●●●';
        passwordVisible = false;
        iconoVer.classList.remove('fa-eye-slash');
        iconoVer.classList.add('fa-eye');
        campoPass.style.letterSpacing = 'normal';
    }
};

// Botón regresar
const returnButton = document.getElementById("return");
if (returnButton) {
    returnButton.addEventListener("click", () => {
        window.location.href = '../index.html';
    });
}