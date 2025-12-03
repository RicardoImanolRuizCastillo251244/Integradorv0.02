import { BASE_URL } from "./api_url.js";

// Variable global para almacenar los datos del usuario
let usuarioActual = null;
let passwordVisible = false;

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
        window.location.href = '../login.html';
        return;
    }

    // Verificar si es el admin hardcodeado
    if (userId === 'admin') {
        // Datos hardcodeados del administrador
        usuarioActual = {
            nombre_usuario: 'Administrador',
            correo_electronico: '000000@ADMIN.upchiapas.edu.mx',
            contrasena_usuario: '12345678',
            id_rol: 3
        };

        console.log('Datos de administrador (hardcodeado):', usuarioActual);

        // Poblar datos del admin
        const nombre = 'Administrador';
        const correo = '000000@ADMIN.upchiapas.edu.mx';
        const iniciales = 'AD';

        // Actualizar DOM
        const circleInicialesElement = document.getElementById('circleIniciales');
        const nombreUsuarioElement = document.getElementById('nombreUsuario');
        const correoUsuarioElement = document.getElementById('correoUsuario');
        const campoNombreElement = document.getElementById('campoNombre');
        
        if (circleInicialesElement) circleInicialesElement.innerText = iniciales;
        if (nombreUsuarioElement) nombreUsuarioElement.innerText = nombre;
        if (correoUsuarioElement) correoUsuarioElement.innerText = correo;
        if (campoNombreElement) campoNombreElement.innerText = nombre;

        // Configurar logout
        configurarLogout();
        return;
    }

    // Para usuarios normales, hacer fetch a la API
    try {
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            usuarioActual = await response.json();
            console.log('Datos de usuario:', usuarioActual);

            // Poblar datos - adaptándose a diferentes nombres de campo del backend
            const nombre = usuarioActual.nombre_usuario || usuarioActual.nombre || usuarioActual.username || 'Usuario';
            const correo = usuarioActual.correo_electronico || usuarioActual.email || usuarioActual.correo_usuario || usuarioActual.correo || 'correo@ejemplo.com';
            const iniciales = nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

            // Actualizar DOM
            const circleInicialesElement = document.getElementById('circleIniciales');
            const nombreUsuarioElement = document.getElementById('nombreUsuario');
            const correoUsuarioElement = document.getElementById('correoUsuario');
            const campoNombreElement = document.getElementById('campoNombre');
            
            if (circleInicialesElement) circleInicialesElement.innerText = iniciales;
            if (nombreUsuarioElement) nombreUsuarioElement.innerText = nombre;
            if (correoUsuarioElement) correoUsuarioElement.innerText = correo;
            if (campoNombreElement) campoNombreElement.innerText = nombre;

            // Configurar logout
            configurarLogout();

        } else {
            console.error('Error al cargar usuario:', response.status);
            alert('Error al cargar información del usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
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
            
            // Redirigir a login (ajustando la ruta desde admin/)
            window.location.href = '../login.html';
        });
    } else {
        console.error('No se encontró el botón de logout');
    }
}

// Funciones globales para los onclick del HTML
window.editarCampo = async function (tipoCampo, nombreCampo) {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    // Si es admin hardcodeado, no permitir edición
    if (userId === 'admin') {
        alert('La cuenta de administrador no puede ser editada desde esta interfaz.');
        return;
    }
    
    let nuevoValor;
    
    if (tipoCampo === 'password') {
        // Usar modal personalizado para contraseña
        mostrarModalPassword();
        return;
    } else {
        // Para otros campos usar prompt simple
        nuevoValor = prompt(`Ingresa el nuevo ${nombreCampo}:`, '');
    }

    if (!nuevoValor || nuevoValor.trim() === '') {
        return;
    }

    try {
        // Obtener datos actuales del usuario
        const getResponse = await fetch(`${BASE_URL}usuario/${userId}`, {
            headers: { 'Authorization': authToken }
        });

        if (!getResponse.ok) {
            alert('Error al obtener datos del usuario');
            return;
        }

        const usuarioData = await getResponse.json();

        // Preparar datos para actualizar
        let updateData = {
            nombre_usuario: usuarioData.nombre_usuario || usuarioData.nombre,
            correo_electronico: usuarioData.correo_electronico || usuarioData.correo,
            contrasena_usuario: usuarioData.contrasena_usuario || usuarioData.password,
            id_rol: usuarioData.id_rol
        };

        // Actualizar el campo correspondiente
        if (tipoCampo === 'nombre') {
            updateData.nombre_usuario = nuevoValor.trim();
        }

        // Enviar actualización
        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert(`${nombreCampo} actualizado correctamente`);
            location.reload();
        } else {
            const errorText = await response.text();
            alert(`Error al actualizar: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
};

// Modal personalizado para cambiar contraseña
function mostrarModalPassword() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalButtons = document.getElementById('modalButtons');

    modalTitle.textContent = 'Cambiar Contraseña';
    
    modalContent.innerHTML = `
        <div class="modal-input-group">
            <label class="modal-label"><i class="fa-solid fa-lock"></i> Nueva Contraseña</label>
            <input type="password" id="nuevaPassword" class="modal-input" placeholder="Ingresa la nueva contraseña" />
        </div>
        <div class="modal-input-group">
            <label class="modal-label"><i class="fa-solid fa-lock"></i> Confirmar Contraseña</label>
            <input type="password" id="confirmarPassword" class="modal-input" placeholder="Confirma la nueva contraseña" />
        </div>
    `;

    modalButtons.innerHTML = `
        <button class="modal-btn modal-btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button class="modal-btn modal-btn-primary" onclick="guardarPassword()">Guardar</button>
    `;

    modalOverlay.classList.add('show');
}

window.guardarPassword = async function() {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    // Si es admin hardcodeado, no permitir edición
    if (userId === 'admin') {
        alert('La cuenta de administrador no puede ser editada desde esta interfaz.');
        cerrarModal();
        return;
    }
    
    const nuevaPassword = document.getElementById('nuevaPassword').value;
    const confirmarPassword = document.getElementById('confirmarPassword').value;

    if (!nuevaPassword || nuevaPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (nuevaPassword !== confirmarPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        // Obtener datos actuales
        const getResponse = await fetch(`${BASE_URL}usuario/${userId}`, {
            headers: { 'Authorization': authToken }
        });

        if (!getResponse.ok) {
            alert('Error al obtener datos del usuario');
            return;
        }

        const usuarioData = await getResponse.json();

        // Actualizar contraseña
        const updateData = {
            nombre_usuario: usuarioData.nombre_usuario || usuarioData.nombre,
            correo_electronico: usuarioData.correo_electronico || usuarioData.correo,
            contrasena_usuario: nuevaPassword,
            id_rol: usuarioData.id_rol
        };

        const response = await fetch(`${BASE_URL}usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert('Contraseña actualizada correctamente');
            cerrarModal();
            location.reload();
        } else {
            const errorText = await response.text();
            alert(`Error al actualizar: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
};

window.cerrarModal = function() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('show');
};

window.togglePass = function() {
    const campoPass = document.getElementById('campoPass');
    const iconoVer = document.querySelector('.icono-ver');
    
    passwordVisible = !passwordVisible;
    
    if (passwordVisible) {
        campoPass.innerText = usuarioActual?.contrasena_usuario || usuarioActual?.password || '●●●●●●';
        iconoVer.classList.remove('fa-eye');
        iconoVer.classList.add('fa-eye-slash');
    } else {
        campoPass.innerText = '●●●●●●';
        iconoVer.classList.remove('fa-eye-slash');
        iconoVer.classList.add('fa-eye');
    }
};
