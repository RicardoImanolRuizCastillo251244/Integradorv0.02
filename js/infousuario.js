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
            const buttonPost = document.getElementById('buttonPost');

            if (rol == 1) {
                // Usuario consumidor
                if (membresia) membresia.style.display = 'none';
                if (estadisticas) estadisticas.style.display = 'none';
                if (containerNumCuenta) containerNumCuenta.style.display = 'none';
                if (containerTitular) containerTitular.style.display = 'none';
                
                // Configurar botón VENDER para cambiar a vendedor
                if (buttonPost) {
                    buttonPost.addEventListener('click', () => cambiarARolVendedor());
                }
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


// ========== FUNCIONES DE MODALES PERSONALIZADOS ==========

function showModal(config) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        const content = document.getElementById('modalContent');
        const buttons = document.getElementById('modalButtons');

        title.textContent = config.title || '';
        
        if (config.message) {
            message.textContent = config.message;
            message.style.display = 'block';
        } else {
            message.style.display = 'none';
        }

        content.innerHTML = config.content || '';
        buttons.innerHTML = '';

        // Crear botones
        if (config.buttons) {
            config.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = `modal-btn ${btn.class || 'modal-btn-secondary'}`;
                button.textContent = btn.text;
                button.onclick = () => {
                    overlay.classList.remove('show');
                    if (btn.callback) btn.callback();
                    resolve(btn.value);
                };
                buttons.appendChild(button);
            });
        }

        overlay.classList.add('show');

        // Cerrar al hacer clic fuera del modal
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
                resolve(null);
            }
        };
    });
}

function showInputModal(title, label, defaultValue = '', type = 'text') {
    return new Promise((resolve) => {
        const inputId = 'modalInput_' + Date.now();
        const content = `
            <div class="modal-input-group">
                <label class="modal-label" for="${inputId}">${label}</label>
                <input type="${type}" id="${inputId}" class="modal-input" value="${defaultValue}" placeholder="${label}">
            </div>
        `;

        showModal({
            title: title,
            content: content,
            buttons: [
                {
                    text: 'Cancelar',
                    class: 'modal-btn-secondary',
                    callback: () => resolve(null)
                },
                {
                    text: 'Aceptar',
                    class: 'modal-btn-primary',
                    callback: () => {
                        const input = document.getElementById(inputId);
                        resolve(input ? input.value : null);
                    }
                }
            ]
        });

        // Focus en el input
        setTimeout(() => {
            const input = document.getElementById(inputId);
            if (input) input.focus();
        }, 100);
    });
}

function showPasswordModal() {
    return new Promise((resolve) => {
        const passId = 'modalPass_' + Date.now();
        const confirmId = 'modalConfirm_' + Date.now();
        const strengthId = 'passStrength_' + Date.now();
        
        const content = `
            <div class="modal-input-group">
                <label class="modal-label" for="${passId}">
                    <i class="fa-solid fa-lock"></i> Nueva contraseña
                </label>
                <input type="password" id="${passId}" class="modal-input" placeholder="Mínimo 8 caracteres">
                <div id="${strengthId}" class="password-strength"></div>
            </div>
            <div class="modal-input-group">
                <label class="modal-label" for="${confirmId}">
                    <i class="fa-solid fa-lock-open"></i> Confirmar contraseña
                </label>
                <input type="password" id="${confirmId}" class="modal-input" placeholder="Confirma tu contraseña">
            </div>
        `;

        showModal({
            title: 'Cambiar Contraseña',
            content: content,
            buttons: [
                {
                    text: 'Cancelar',
                    class: 'modal-btn-secondary',
                    callback: () => resolve(null)
                },
                {
                    text: 'Cambiar',
                    class: 'modal-btn-primary',
                    callback: () => {
                        const pass = document.getElementById(passId).value;
                        const confirm = document.getElementById(confirmId).value;
                        resolve({ password: pass, confirm: confirm });
                    }
                }
            ]
        });

        // Agregar validación de fuerza de contraseña
        setTimeout(() => {
            const passInput = document.getElementById(passId);
            const strengthDiv = document.getElementById(strengthId);
            
            if (passInput && strengthDiv) {
                passInput.focus();
                passInput.addEventListener('input', () => {
                    const password = passInput.value;
                    const strength = checkPasswordStrength(password);
                    strengthDiv.textContent = strength.text;
                    strengthDiv.className = 'password-strength ' + strength.class;
                });
            }
        }, 100);
    });
}

function checkPasswordStrength(password) {
    if (password.length === 0) {
        return { text: '', class: '' };
    }
    if (password.length < 8) {
        return { text: '⚠️ Muy débil - Necesitas al menos 8 caracteres', class: 'weak' };
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
        return { text: '⚠️ Débil', class: 'weak' };
    } else if (strength <= 3) {
        return { text: '✓ Media', class: 'medium' };
    } else {
        return { text: '✓✓ Fuerte', class: 'strong' };
    }
}

function showAlert(title, message, type = 'info') {
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    
    return showModal({
        title: icon + ' ' + title,
        message: message,
        buttons: [
            {
                text: 'Entendido',
                class: 'modal-btn-primary',
                callback: () => {}
            }
        ]
    });
}


// ========== FUNCIONES DE CONFIGURACIÓN ==========

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
        // Usar modal personalizado para contraseña
        const result = await showPasswordModal();
        
        if (!result || !result.password) {
            return; // Usuario canceló
        }
        
        if (result.password.length < 8) {
            await showAlert('Error', 'La contraseña debe tener al menos 8 caracteres.', 'error');
            return;
        }
        
        if (result.password !== result.confirm) {
            await showAlert('Error', 'Las contraseñas no coinciden.', 'error');
            return;
        }
        
        nuevoValor = result.password;
    } else {
        // Para otros campos - usar modal de input
        let valorActual = '';
        let labelText = nombreCampo;
        
        if (tipoCampo === 'nombre') {
            valorActual = document.getElementById('campoNombre').textContent;
        } else if (tipoCampo === 'numero_cuenta') {
            valorActual = document.getElementById('campoNumCuenta').textContent;
            if (valorActual === 'No registrado') valorActual = '';
            labelText = 'Ingresa tu número de cuenta';
        } else if (tipoCampo === 'titular') {
            valorActual = document.getElementById('campoTitular').textContent;
            if (valorActual === 'No registrado') valorActual = '';
            labelText = 'Ingresa el nombre del titular';
        }
        
        nuevoValor = await showInputModal(
            'Editar ' + nombreCampo,
            labelText,
            valorActual
        );
        
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
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
                'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
                'User-Id': userId
            },
            body: JSON.stringify(datosActualizacion)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Actualizar la vista
            if (tipoCampo === 'nombre') {
                document.getElementById('campoNombre').textContent = nuevoValor;
                document.getElementById('nombreUsuario').textContent = nuevoValor;
                const iniciales = nuevoValor.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                document.getElementById('circleIniciales').textContent = iniciales;
                if (usuarioActual) usuarioActual.nombre_usuario = nuevoValor;
                
                await showAlert('¡Éxito!', 'Nombre actualizado correctamente.', 'success');
            } else if (tipoCampo === 'password') {
                // Ocultar la contraseña si estaba visible
                passwordVisible = false;
                document.getElementById('campoPass').textContent = '●●●●●●';
                const iconoVer = document.querySelector('.icono-ver');
                if (iconoVer) {
                    iconoVer.classList.remove('fa-eye-slash');
                    iconoVer.classList.add('fa-eye');
                }
                
                await showAlert('¡Éxito!', 'Contraseña actualizada correctamente. Se recomienda cerrar sesión y volver a iniciar.', 'success');
            } else if (tipoCampo === 'numero_cuenta') {
                document.getElementById('campoNumCuenta').textContent = nuevoValor;
                if (usuarioActual) usuarioActual.numero_cuenta = nuevoValor;
                
                await showAlert('¡Éxito!', 'Número de cuenta actualizado correctamente.', 'success');
            } else if (tipoCampo === 'titular') {
                document.getElementById('campoTitular').textContent = nuevoValor;
                if (usuarioActual) usuarioActual.titular_usuario = nuevoValor;
                
                await showAlert('¡Éxito!', 'Titular de cuenta actualizado correctamente.', 'success');
            }
        } else {
            const errorMsg = await response.text();
            throw new Error(errorMsg || 'Error al actualizar');
        }
        
    } catch (error) {
        console.error('Error en actualización:', error);
        await showAlert('Error', 'Error al actualizar: ' + error.message, 'error');
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

// Función para cambiar de consumidor a vendedor
async function cambiarARolVendedor() {
    try {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        
        if (!userId || !authToken) {
            await showAlert('Error', 'No se encontró sesión de usuario.', 'error');
            return;
        }
        
        // Verificar que tenga número de cuenta y titular registrados
        if (!usuarioActual.numero_cuenta || !usuarioActual.titular_cuenta) {
            // Mostrar los campos para que el usuario los registre
            const containerNumCuenta = document.getElementById('containerNumCuenta');
            const containerTitular = document.getElementById('containerTitular');
            
            if (containerNumCuenta) containerNumCuenta.style.display = 'flex';
            if (containerTitular) containerTitular.style.display = 'flex';
            
            await showAlert(
                'Información requerida',
                'Para ser vendedor necesitas registrar tu número de cuenta y nombre del titular. Los campos ya están visibles en tu perfil.',
                'warning'
            );
            return;
        }
        
        // Mostrar modal de confirmación
        const confirmacion = await showModal(
            '¿Quieres ser vendedor?',
            'Al cambiar a rol de vendedor podrás publicar productos y gestionar ventas. ¿Deseas continuar?',
            true
        );
        
        if (!confirmacion) return;
        
        // Actualizar el rol en la base de datos
        const response = await fetch(`${BASE_URL}/usuario`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'User-Id': userId,
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                id_rol: 2 // Cambiar a vendedor
            })
        });
        
        if (response.ok) {
            // Actualizar rol en localStorage
            localStorage.setItem('rol', '2');
            
            await showAlert(
                '¡Felicidades!',
                'Ahora eres vendedor. Tu perfil se actualizará.',
                'success'
            );
            
            // Recargar la página para mostrar el panel de vendedor
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            const errorText = await response.text();
            await showAlert('Error', `No se pudo cambiar el rol: ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('Error al cambiar rol:', error);
        await showAlert('Error', 'Ocurrió un error al intentar cambiar el rol.', 'error');
    }
}