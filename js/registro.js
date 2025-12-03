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

        if (response.ok) { // 201 Created
            const data = await response.json();
            // Registro exitoso
            console.log('Registro exitoso:', data);

            // Guardar datos del usuario registrado en localStorage (opcional)
            // La respuesta incluye: userId, message
            if (data && data.userId) {
                // Guardar temporalmente el ID del nuevo usuario
                localStorage.setItem('nuevo_usuario_id', data.userId);
            }

            // Mostrar mensaje de éxito
            alert('¡Registro exitoso! Por favor inicia sesión con tus credenciales.');

            // Limpiar formulario
            registroForm.reset();

            // Redirigir al login
            window.location.href = 'login.html';
        } else {
            // Error del servidor (400, 500, etc.)
            const errorMessage = await response.text();
            
            if (response.status === 400) {
                // Datos inválidos o usuario ya existe
                if (errorMessage.toLowerCase().includes('correo') || errorMessage.toLowerCase().includes('email')) {
                    throw new Error('Este correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.');
                } else if (errorMessage.toLowerCase().includes('usuario')) {
                    throw new Error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
                } else {
                    throw new Error(errorMessage || 'Los datos proporcionados no son válidos. Por favor, verifica la información.');
                }
            } else if (response.status === 500) {
                // Error del servidor
                throw new Error('Error en el servidor. Por favor, intenta más tarde.');
            } else {
                throw new Error(errorMessage || 'Error al registrar usuario. Por favor, intenta nuevamente.');
            }
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
