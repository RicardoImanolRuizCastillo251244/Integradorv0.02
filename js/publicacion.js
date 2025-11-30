import { BASE_URL} from "./api_url.js";
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const form = document.getElementById('form-publicar');
    const imagenInput = document.getElementById('imagenInput');
    const preview = document.getElementById('preview');
    const iconoUpload = document.querySelector('.upload-box i');
    const popupExito = document.getElementById('popup-exito');
    const popupError = document.getElementById('popup-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    // 1. Preview de imagen
    imagenInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                mostrarError('Por favor selecciona un archivo de imagen válido.');
                this.value = ''; // Limpiar input
                resetPreview();
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                mostrarError('La imagen no debe superar los 5MB.');
                this.value = ''; // Limpiar input
                resetPreview();
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                iconoUpload.style.display = 'none';
            }
            reader.readAsDataURL(file);
        } else {
            resetPreview();
        }
    });

    function resetPreview() {
        preview.src = '';
        preview.style.display = 'none';
        iconoUpload.style.display = 'block';
    }

    // 2. Manejo del envío del formulario
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Obtener id_vendedor del localStorage
        const idVendedor = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');

        if (!idVendedor || !token) {
            alert('Debes iniciar sesión para crear una publicación');
            window.location.href = 'login.html';
            return;
        }

        // Extraer valores
        const titulo = document.getElementById('titulo').value.trim();
        const precio = document.getElementById('precio').value.trim();
        const categoria = document.getElementById('categoria').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const existencia = document.getElementById('existencia').value.trim();
        const archivoImagen = imagenInput.files[0];

        console.log(precio>=0)
            console.log(precio<50000)
        // Validaciones básicas
        if (!titulo || !precio || !categoria || !descripcion || !existencia) {
            mostrarError('Por favor completa todos los campos obligatorios.');
            return;
        }

        if (precio <= 0 || precio>50000) {
            
            mostrarError('Por favor ingresa un precio válido.');
            return;
        }

        try {
            // Mostrar estado de carga
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publicando...';

            // Construir FormData
            const formData = new FormData();
            formData.append('titulo_publicacion', titulo);
            formData.append('descripcion_publicacion', descripcion);
            formData.append('precio_producto', precio);
            formData.append('id_vendedor', idVendedor);
            formData.append('existencia', existencia);

            //MAP CATEGORIAS
            const categoriasMap = {
                'alimentos': 1,
                'prendas': 2,
                'materiales': 3,
                'servicios': 4
            };
            const idCategoria = categoriasMap[categoria] || 1;
            formData.append('id_categoria', idCategoria);

            if (archivoImagen) {
                formData.append('foto_publicacion', archivoImagen);
            }

            console.log(formData)
            // Realizar petición
            const response = await fetch(BASE_URL+'publicacion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' // NO poner esto manualmente con FormData
                },
                body: formData
            });

            if (response.ok) {
                // Éxito (201 Created)
                const data = await response.json();
                console.log('Publicación creada:', data);

                mostrarExito();

                // Limpiar formulario
                form.reset();
                resetPreview();
            } else {
                // Error (400, 401, 500)
                const errorData = await response.json().catch(() => ({}));
                const mensajeError = errorData.message || 'Ocurrió un error al crear la publicación.';

                if (response.status === 401) {
                    alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
                    window.location.href = 'login.html';
                    return;
                }

                throw new Error(mensajeError);
            }

        } catch (error) {
            console.error('Error:', error);
            let msg = error.message;
            if (error.message === 'Failed to fetch') {
                msg = 'No se pudo conectar con el servidor.';
            }
            mostrarError(msg);
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar';
        }
    });

    function mostrarExito() {
        popupExito.style.display = 'flex';
        setTimeout(() => {
            popupExito.classList.add('desaparecer');
        }, 2000);
        setTimeout(() => {
            popupExito.style.display = 'none';
            popupExito.classList.remove('desaparecer');
        }, 2600);
    }

    function mostrarError(mensaje) {
        // Actualizar texto del popup de error si es posible, o usar el default
        const textoError = popupError.querySelector('p');
        if (textoError) textoError.textContent = mensaje;

        popupError.style.display = 'flex';
        setTimeout(() => {
            popupError.classList.add('desaparecer');
        }, 3000);
        setTimeout(() => {
            popupError.style.display = 'none';
            popupError.classList.remove('desaparecer');
            // Restaurar mensaje default
            if (textoError) textoError.textContent = 'Error al publicar producto';
        }, 3600);
    }
});


const returnFunction = document.getElementById("return")

returnFunction.addEventListener("click", ()=>{
    window.history.go(-1)
})