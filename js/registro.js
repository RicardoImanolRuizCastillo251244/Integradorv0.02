import { BASE_URL } from "./api_url.js";
// Toggle mostrar/ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Cambiar icono
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Validación del formulario
const registroForm = document.getElementById('registroForm');
const emailInput = document.getElementById('email');
const usernameInput = document.getElementById('username');
const tipoUsuarioInput = document.getElementById('tipoUsuario');
const passwordInputVal = document.getElementById('password');
const errorGeneral = document.getElementById('errorGeneral');
const errorText = document.getElementById('errorText');
const submitBtn = registroForm.querySelector('button[type="submit"]');

registroForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Reset errores
    resetErrors();

    let isValid = true;
    let errorMessage = '';

    // Validar email
    const emailValue = emailInput.value.trim();
    if (emailValue === '') {
        emailInput.classList.add('error');
        errorMessage = 'Por favor ingresa tu correo electrónico';
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        emailInput.classList.add('error');
        errorMessage = 'Por favor ingresa un correo electrónico válido';
        isValid = false;
    }

    // Validar username
    const usernameValue = usernameInput.value.trim();
    if (usernameValue === '') {
        usernameInput.classList.add('error');
        if (!errorMessage) errorMessage = 'Por favor ingresa tu nombre de usuario';
        isValid = false;
    }

    // Validar tipo de usuario
    const tipoUsuarioValue = tipoUsuarioInput.value;
    if (tipoUsuarioValue === '') {
        tipoUsuarioInput.classList.add('error');
        if (!errorMessage) errorMessage = 'Por favor selecciona un tipo de usuario';
        isValid = false;
    }

    // Validar password
    const passwordValue = passwordInputVal.value.trim();
    if (passwordValue === '') {
        passwordInputVal.classList.add('error');
        if (!errorMessage) errorMessage = 'Por favor ingresa tu contraseña';
        isValid = false;
    }

    // Mostrar error general si hay campos vacíos
    if (!isValid) {
        if (emailValue === '' && usernameValue === '' && passwordValue === '' && tipoUsuarioValue === '') {
            errorMessage = 'Por favor completa todos los campos.';
        }
        showError(errorMessage);
        return;
    }

    // Si todo es válido, proceder con el registro
    try {
        // Deshabilitar botón y mostrar carga
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';

        // Mapear rol a ID (1: Consumidor, 2: Vendedor)
        const idRol = tipoUsuarioValue === 'consumidor' ? 1 : 2;

        // Construir URL con password como query param
const url = `${BASE_URL}auth/register`;
        // Datos del body
        const userData = {
            id_rol: idRol,
            nombre_usuario: usernameValue,
            correo_usuario: emailValue,
            contrasena: passwordValue,
        };

        // Realizar petición
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) { // 201 Created
            // Registro exitoso
            console.log('Registro exitoso:', data);

            // Guardar datos del usuario registrado en localStorage (opcional)
            // La respuesta incluye: id_rol, nombre_usuario, correo_usuario, numero_cuenta, titular_usuario
            if (data) {
                // Guardar temporalmente los datos del nuevo usuario
                localStorage.setItem('usuario_registrado', JSON.stringify({
                    id_rol: data.id_rol,
                    nombre_usuario: data.nombre_usuario,
                    correo_usuario: data.correo_usuario,
                    numero_cuenta: data.numero_cuenta || null,
                    titular_usuario: data.titular_usuario || null
                }));
            }

            // Mostrar mensaje de éxito
            alert('Registro exitoso. Por favor inicia sesión.');

            // Limpiar formulario
            registroForm.reset();

            // Redirigir al login
            window.location.href = 'login.html';
        } else {
            // Error del servidor (400, 500, etc.)
            throw new Error(data.message || 'Error al registrar usuario');
        }

    } catch (error) {
        console.error('Error en registro:', error);
        let msg = error.message;
        if (error.message === 'Failed to fetch') {
            msg = 'No se pudo conectar con el servidor. Intenta más tarde.';
        }
        showError(msg);
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrarse';
    }
});

function showError(message) {
    errorText.textContent = message;
    errorGeneral.classList.add('show');

    // Ocultar después de 5 segundos
    setTimeout(() => {
        errorGeneral.classList.remove('show');
    }, 5000);
}

function resetErrors() {
    const inputs = document.querySelectorAll('.form-control-login');
    inputs.forEach(input => input.classList.remove('error'));
    errorGeneral.classList.remove('show');
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Remover error al escribir
[emailInput, usernameInput, tipoUsuarioInput, passwordInputVal].forEach(input => {
    if (input) {
        input.addEventListener('input', function () {
            this.classList.remove('error');
            errorGeneral.classList.remove('show');
        });
        // Para select
        input.addEventListener('change', function () {
            this.classList.remove('error');
            errorGeneral.classList.remove('show');
        });
    }
});
