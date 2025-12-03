import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Validar Sesión y Datos de Compra
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const compraDataJSON = localStorage.getItem('productoCompra');

    if (!userId || !token) {
        alert("Debes iniciar sesión para continuar.");
        window.location.href = 'login.html';
        return;
    }

    if (!compraDataJSON) {
        alert("No hay una compra pendiente.");
        window.location.href = '../index.html';
        return;
    }

    const compraData = JSON.parse(compraDataJSON);
    console.log("Datos de compra:", compraData);

    // 2. Referencias al DOM (Usando TUS IDs del HTML)
    const btnFinalizar = document.getElementById('btnFinalizar'); // Tu botón exacto
    const btnTransfer = document.getElementById('btnTransfer');
    const btnEfectivo = document.getElementById('btnEfectivo');
    const seccionTransferencia = document.getElementById('seccionTransferencia');
    const mensajeEfectivo = document.getElementById('mensajeEfectivo');
    
    const inputTitular = document.getElementById('titular');
    const inputCuenta = document.getElementById('cuenta');
    
    const uploadInput = document.getElementById('uploadInput');
    const previewImg = document.getElementById('previewImg');
    const uploadArea = document.getElementById('uploadArea');

    // Elemento del total (no tiene ID en tu HTML, lo buscamos por clase)
    const totalDisplay = document.querySelector('.contenedor-info .row .col-6.text-end');
    if(totalDisplay) totalDisplay.textContent = `$${compraData.total}`;

    // 3. Cargar Datos del Vendedor (Para mostrar a quién depositar)
    try {
        const response = await fetch(`${BASE_URL}usuario/${compraData.vendedor}`);
        if (response.ok) {
            const vendedor = await response.json();
            // Llenamos los inputs y los hacemos de solo lectura
            inputTitular.value = vendedor.titular_usuario || vendedor.nombre_usuario || "No especificado";
            inputCuenta.value = vendedor.numero_cuenta || "No especificado";
            inputTitular.readOnly = true;
            inputCuenta.readOnly = true;
        }
    } catch (e) {
        console.error("Error cargando vendedor", e);
    }

    // 4. Lógica de Toggles (Transferencia / Efectivo)
    let metodoPago = 'transferencia'; // Default

    btnTransfer.addEventListener('click', () => {
        metodoPago = 'transferencia';
        alternarEstilosBotones(btnTransfer, btnEfectivo);
        seccionTransferencia.style.display = 'block';
        mensajeEfectivo.style.display = 'none';
    });

    btnEfectivo.addEventListener('click', () => {
        metodoPago = 'efectivo';
        alternarEstilosBotones(btnEfectivo, btnTransfer);
        seccionTransferencia.style.display = 'none';
        mensajeEfectivo.style.display = 'block';
    });

    function alternarEstilosBotones(activo, inactivo) {
        // Puedes agregar una clase CSS 'active' para cambiar colores si quieres
        activo.querySelector('i').className = "fa-solid fa-circle-check";
        inactivo.querySelector('i').className = "fa-regular fa-circle";
    }

    // 5. Previsualización de Imagen
    uploadArea.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("La imagen no debe superar los 5MB");
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                previewImg.src = ev.target.result;
                previewImg.style.display = 'block';
                // Ocultar icono
                const icon = uploadArea.querySelector('i');
                if(icon) icon.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // 6. Lógica de Finalizar Compra (Tu Botón)
    btnFinalizar.addEventListener('click', async (e) => {
        e.preventDefault();

        // Validaciones
        if (metodoPago === 'transferencia' && (!uploadInput.files || uploadInput.files.length === 0)) {
            alert("⚠️ Por favor sube el comprobante de transferencia.");
            return;
        }

        btnFinalizar.disabled = true;
        btnFinalizar.textContent = "Procesando...";

        try {
            // Preparar FormData para el backend
            const formData = new FormData();
            formData.append('id_publicacion', compraData.productoId);
            formData.append('cantidad_vendida', compraData.cantidad);
            formData.append('precio_total', compraData.total);
            formData.append('id_comprador', userId);

            // Si es transferencia y hay archivo, lo enviamos
            if (metodoPago === 'transferencia' && uploadInput.files[0]) {
                formData.append('imagen', uploadInput.files[0]);
            }
            
            // Nota: Si es efectivo, no enviamos imagen, el backend guardará null o blob vacío.

            const response = await fetch(`${BASE_URL}venta`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Id': userId
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error al registrar la venta");
            }

            // ÉXITO
            alert("¡Compra realizada con éxito! 🎉");
            localStorage.removeItem('productoCompra');
            
            // Redirigir a "Mis Compras"
            window.location.href = 'compraconcretadas.html';

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
            btnFinalizar.disabled = false;
            btnFinalizar.textContent = "Finalizar compra";
        }
    });
});