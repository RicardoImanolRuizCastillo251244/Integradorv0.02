import { BASE_URL } from "./api_url.js";
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const formQueja = document.getElementById('formQueja');
    const txtArea = document.getElementById('txtArea');
    const txtMotivo = document.getElementById('txtMotivo');
    const lblMotivo = document.getElementById('lblMotivo');
    const charCount = document.getElementById('charCount');
    const imagenInput = document.getElementById('imagenInput');
    const preview = document.getElementById('preview');
    const btnEnviar = document.getElementById('btnEnviar');
    const infoContexto = document.getElementById('infoContexto');
    const idReceptorInput = document.getElementById('idReceptor');
    const idVentaInput = document.getElementById('idVenta');
    const tipoQuejaInput = document.getElementById('tipoQueja');

    // 1. Obtener parámetros de URL para determinar contexto
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo'); // 'usuario' o 'venta'
    const id = urlParams.get('id'); // ID del usuario o venta

    // Configurar formulario según el tipo
    if (tipo === 'venta') {
        tipoQuejaInput.value = 'venta';
        idVentaInput.value = id;
        lblMotivo.textContent = 'Tipo de Problema';
        txtMotivo.placeholder = 'Ej: Producto dañado, No recibido';
        infoContexto.textContent = `Reportando problema con la Venta ID: ${id}`;
    } else {
        // Default: Queja de Usuario
        tipoQuejaInput.value = 'usuario';
        idReceptorInput.value = id;
        lblMotivo.textContent = 'Motivo';
        txtMotivo.placeholder = 'Ej: Comportamiento ofensivo';
        infoContexto.textContent = id ? `Reportando al Usuario ID: ${id}` : 'Reportando a un usuario';
    }

    // 2. Contador de caracteres
    txtArea.addEventListener('input', () => {
        const length = txtArea.value.length;
        charCount.textContent = `${length} caracteres`;
        if (length < 20) {
            charCount.style.color = 'red';
        } else {
            charCount.style.color = 'green';
        }
    });

    // 3. Preview de imagen
    imagenInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen válido.');
                this.value = '';
                preview.style.display = 'none';
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('La imagen no debe superar los 5MB.');
                this.value = '';
                preview.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
            preview.src = '#';
        }
    });

    // 4. Manejo del envío
    formQueja.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tipoActual = tipoQuejaInput.value;
        if (tipoActual === 'usuario') {
            await crearQuejaUsuario();
        } else if (tipoActual === 'venta') {
            await crearQuejaVenta();
        }
    });

    // --- FUNCIONES PRINCIPALES ---

    async function crearQuejaUsuario() {
        try {
            // 1. Validaciones previas
            const idEmisor = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');

            if (!idEmisor || !authToken) {
                alert('Debes iniciar sesión para enviar una queja.');
                window.location.href = 'login.html';
                return;
            }

            const idReceptor = idReceptorInput.value;
            const descripcion = txtArea.value.trim();
            const motivo = txtMotivo.value.trim();
            const imagen = imagenInput.files[0];

            if (!idReceptor) {
                alert('Error: No se especificó el usuario a reportar.');
                return;
            }

            if (parseInt(idEmisor) === parseInt(idReceptor)) {
                alert('No puedes reportarte a ti mismo.');
                return;
            }

            if (descripcion.length < 20) {
                alert('La descripción debe tener al menos 20 caracteres.');
                return;
            }

            // 2. Construir FormData
            const formData = new FormData();
            formData.append('id_emisor', idEmisor);
            formData.append('id_receptor', idReceptor);
            formData.append('descripcion_queja', descripcion);

            if (motivo) formData.append('motivo_queja', motivo);
            if (imagen) formData.append('imagen', imagen);

            // 3. UI Loading
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

            // 4. Fetch
            const response = await fetch(BASE_URL+'queja-usuario', {
                method: 'POST',
                headers: {
                    'Authorization': authToken
                },
                body: formData
            });

            // 5. Respuesta
            if (response.ok) {
                const data = await response.json();
                alert(`Queja de usuario enviada exitosamente. ID: ${data.id}`);
                formQueja.reset();
                preview.style.display = 'none';
                // Opcional: regresar
                // window.history.back();
            } else {
                const errorText = await response.text();
                alert(`Error al enviar queja: ${errorText}`);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al enviar la queja.');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = 'Enviar <i class="fa-solid fa-paper-plane ms-1"></i>';
        }
    }

    async function crearQuejaVenta() {
        try {
            // 1. Validaciones previas
            const idEmisor = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');

            if (!idEmisor || !authToken) {
                alert('Debes iniciar sesión para enviar una queja.');
                window.location.href = 'login.html';
                return;
            }

            const idVenta = idVentaInput.value;
            const descripcion = txtArea.value.trim();
            const tipoProblema = txtMotivo.value.trim(); // Usamos el mismo input
            const imagen = imagenInput.files[0];

            if (!idVenta) {
                alert('Error: No se especificó la venta a reportar.');
                return;
            }

            if (descripcion.length < 20) {
                alert('La descripción debe tener al menos 20 caracteres.');
                return;
            }

            // 2. Construir FormData
            const formData = new FormData();
            formData.append('id_emisor', idEmisor);
            formData.append('id_venta', idVenta);
            formData.append('descripcion_queja', descripcion);

            if (tipoProblema) formData.append('tipo_problema', tipoProblema);
            if (imagen) formData.append('imagen', imagen);

            // 3. UI Loading
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

            // 4. Fetch
            const response = await fetch(BASE_URL+'queja-venta', {
                method: 'POST',
                headers: {
                    'Authorization': authToken
                },
                body: formData
            });

            // 5. Respuesta
            if (response.ok) {
                const data = await response.json();
                alert(`Queja de venta enviada exitosamente. ID: ${data.id}`);
                formQueja.reset();
                preview.style.display = 'none';
            } else {
                const errorText = await response.text();
                alert(`Error al enviar queja: ${errorText}`);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al enviar la queja.');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = 'Enviar <i class="fa-solid fa-paper-plane ms-1"></i>';
        }
    }
});
