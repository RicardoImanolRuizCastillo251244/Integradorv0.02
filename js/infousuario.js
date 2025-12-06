import { BASE_URL } from "./api_url.js";

// Variable global para almacenar los datos del usuario
let usuarioActual = null;
let passwordVisible = false;

// Función para configurar la navegación de los tabs según el rol
function configurarNavegacionTabs(rol) {
    console.log('Configurando tabs para rol:', rol);
    
    const comprasTab = document.getElementById('compras');
    const estadisticasTab = document.getElementById('estadisticas');
    const membresiaTab = document.getElementById('membresia');
    
    if (rol == "2" || rol === 2) {
        // Usuario VENDEDOR
        console.log('Configurando vista para VENDEDOR');
        
        // Cambiar el texto del tab "Compras" a "Ventas"
        if (comprasTab) {
            comprasTab.textContent = 'Ventas';
            comprasTab.onclick = null; // Remover onclick del HTML
            comprasTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = './vendedor/ventas.html';
            });
        }
        
        // Configurar tab de estadísticas
        if (estadisticasTab) {
            estadisticasTab.style.display = 'block';
            estadisticasTab.onclick = null;
            estadisticasTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = './vendedor/estadistica.html';
            });
        }
        
        // Configurar tab de membresía
        if (membresiaTab) {
            membresiaTab.style.display = 'block';
            membresiaTab.onclick = null;
            membresiaTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = './vendedor/pagomenbre.html';
            });
        }
        
    } else if (rol == "1" || rol === 1) {
        // Usuario CONSUMIDOR
        console.log('Configurando vista para CONSUMIDOR');
        
        // Tab "Compras" redirige a compraconcretadas.html
        if (comprasTab) {
            comprasTab.textContent = 'Compras';
            comprasTab.onclick = null;
            comprasTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'compraconcretadas.html';
            });
        }
        
        // Ocultar tabs de vendedor
        if (estadisticasTab) estadisticasTab.style.display = 'none';
        if (membresiaTab) membresiaTab.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const infousuario = document.getElementById('contenedor-global');
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    const rol = localStorage.getItem("rol");
    
    // Configurar navegación de tabs según el rol
    configurarNavegacionTabs(rol);
    
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
                    <button type="button" id="buttonPost" class="btn-publicar pb-2 pt-2">PUBLICAR PRODUCTO
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

            console.log('Rol actual:', rol, 'Tipo:', typeof rol);

            if (rol == 1 || rol === '1') {
                // Usuario consumidor - mostrar campos de cuenta para que los llene
                if (membresia) membresia.style.display = 'none';
                if (estadisticas) estadisticas.style.display = 'none';
                // Mostrar campos de cuenta y titular para que el usuario los llene
                if (containerNumCuenta) containerNumCuenta.style.display = 'flex';
                if (containerTitular) containerTitular.style.display = 'flex';
                if (containerPublicar) containerPublicar.style.display = 'flex';
                
                // Cambiar texto y acción del botón para consumidores
                if (buttonPost) {
                    buttonPost.textContent = 'VENDER';
                    buttonPost.addEventListener('click', () => cambiarARolVendedor());
                }
            } else {
                // Usuario vendedor - botón publicar redirige a página de publicación
                if (containerPublicar) containerPublicar.style.display = 'flex';
                
                if (buttonPost) {
                    buttonPost.innerHTML = 'PUBLICAR PRODUCTO <img class="img-btn-publicar mb-1" src="/images/editar.png" alt="">';
                    buttonPost.addEventListener('click', () => {
                        window.location.href = '../vendedor/publicacion.html';
                    });
                }
                
                // Agregar botón para volver a consumidor dinámicamente
                const volverBtn = document.createElement('div');
                volverBtn.className = 'col-12 d-flex justify-content-center mt-3 mb-4';
                volverBtn.innerHTML = '<button type="button" class="btn btn-secondary pb-2 pt-2" id="btnVolverConsumidor">VOLVER A CONSUMIDOR</button>';
                containerPublicar.parentNode.insertBefore(volverBtn, containerPublicar.nextSibling);
                
                document.getElementById('btnVolverConsumidor').addEventListener('click', () => cambiarAConsumidor());
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
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        alert('No se encontró sesión de usuario.');
        return;
    }
    
    // Obtener valores de los campos
    const numCuenta = document.getElementById('campoNumCuenta').textContent.trim();
    const titular = document.getElementById('campoTitular').textContent.trim();
    
    // Validar que estén llenos
    if (numCuenta === 'No registrado' || numCuenta === '' || 
        titular === 'No registrado' || titular === '') {
        alert('Debes llenar tu número de cuenta y nombre del titular antes de ser vendedor.');
        return;
    }
    
    // Confirmar
    if (!confirm('¿Quieres cambiar a vendedor? Podrás publicar y vender productos.')) {
        return;
    }
    
    try {
        // Actualizar rol con PATCH (más simple)
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
                'User-Id': userId
            },
            body: JSON.stringify({ id_rol: 2 })
        });
        
        if (response.ok) {
            localStorage.setItem('rol', '2');
            alert('¡Ahora eres vendedor!');
            window.location.reload();
        } else {
            const error = await response.text();
            alert('Error al cambiar el rol: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al cambiar el rol');
    }
}

// Función para cambiar de vendedor a consumidor
async function cambiarAConsumidor() {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        alert('No se encontró sesión de usuario.');
        return;
    }
    
    // Confirmar
    if (!confirm('¿Quieres volver a ser consumidor? Perderás acceso a publicar productos.')) {
        return;
    }
    
    try {
        // Actualizar rol con PATCH
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
                'User-Id': userId
            },
            body: JSON.stringify({ id_rol: 1 })
        });
        
        if (response.ok) {
            localStorage.setItem('rol', '1');
            alert('Ahora eres consumidor.');
            window.location.reload();
        } else {
            const error = await response.text();
            alert('Error al cambiar el rol: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al cambiar el rol');
    }
}