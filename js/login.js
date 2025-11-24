// Toggle mostrar/ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const btn_infoUs = document.getElementById('btn_infoUs')

btn_infoUs.addEventListener('click',()=>{
  const userId = localStorage.getItem('userId');
            if(userId){
                window.location.href = '/pages/publicacion.html';
            }
            else{
                window.location.href = '/pages/login.html';
            }
})

togglePassword.addEventListener('click', function () {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);

  // Cambiar icono
  this.classList.toggle('fa-eye');
  this.classList.toggle('fa-eye-slash');
});

// Validación del formulario
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const errorGeneral = document.getElementById('errorGeneral');
const errorText = document.getElementById('errorText');
const submitBtn = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async function (e) {
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

  // Validar password
  const passwordValue = passwordInput.value.trim();
  if (passwordValue === '') {
    passwordInput.classList.add('error');
    if (!errorMessage) errorMessage = 'Por favor ingresa tu contraseña';
    isValid = false;
  }

  // Mostrar error general si hay campos vacíos
  if (!isValid) {
    if (emailValue === '' && passwordValue === '') {
      errorMessage = 'La dirección de correo electrónico o la contraseña ingresada no son correctas.';
    }
    showError(errorMessage);
    return;
  }

  // Si todo es válido, proceder con el login
  try {
    // Deshabilitar botón y mostrar carga
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando sesión...';

    const url = 'http://3.217.116.105:7000/auth/login';
    const credentials = {
      correo_usuario: emailValue,
      contrasena: passwordValue
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (response.ok) { // 200 OK
      // Login exitoso
      console.log('Login exitoso');

      // Guardar token y userId en localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);

      // Redirigir a la página principal o dashboard
      // Ajusta esta ruta según tu estructura (ej. index.html o infousuario.html)
      window.location.href = 'infousuario.html';
    } else {
      // Error de credenciales o servidor (401, 400, 500)
      throw new Error(data.message || 'Credenciales inválidas');
    }

  } catch (error) {
    console.error('Error en login:', error);
    let msg = error.message;
    if (error.message === 'Failed to fetch') {
      msg = 'No se pudo conectar con el servidor. Intenta más tarde.';
    }
    showError(msg);
  } finally {
    // Restaurar botón
    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';
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
[emailInput, passwordInput].forEach(input => {
  input.addEventListener('input', function () {
    this.classList.remove('error');
    errorGeneral.classList.remove('show');
  });
});
