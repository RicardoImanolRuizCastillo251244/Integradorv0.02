import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    // ELEMENTOS DEL DOM
    const vistaPlan = document.getElementById('vistaPlan');
    const vistaPago = document.getElementById('vistaPago');
    const btnContinuarPago = document.getElementById('btnContinuarPago');
    const btnTransferencia = document.getElementById('btnTransferencia');
    const btnEfectivo = document.getElementById('btnEfectivo');
    const seccionTransferencia = document.getElementById('seccionTransferencia');
    const seccionEfectivo = document.getElementById('seccionEfectivo');
    const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
    const inputEvidencia = document.getElementById('inputEvidencia');
    const previewEvidencia = document.getElementById('previewEvidencia');
    const errorEvidencia = document.getElementById('errorEvidencia');
    const errorTipoPago = document.getElementById('errorTipoPago');
    const modalExito = document.getElementById('modalExito');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const totalPago = document.getElementById('totalPago');
    const returnBtn = document.getElementById('return');

    // VARIABLES DE ESTADO
    let planSeleccionado = null;
    let precioSeleccionado = 0;
    let tipoPagoSeleccionado = null;
    let archivoEvidencia = null;

    // Validar login
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
        alert('Debes iniciar sesión para ver los planes.');
        window.location.href = '../login.html';
        return;
    }

    // Botón regresar
    returnBtn.addEventListener('click', () => {
        if (vistaPago.classList.contains('vista-activa')) {
            // Si está en vista de pago, volver a vista de plan
            vistaPago.classList.remove('vista-activa');
            vistaPago.classList.add('vista-oculta');
            vistaPlan.classList.remove('vista-oculta');
            vistaPlan.classList.add('vista-activa');
            resetearFormulario();
        } else {
            // Si está en vista de plan, volver al index
            window.location.href = '../infousuario.html';
        }
    });

    // CONTINUAR AL FORMULARIO DE PAGO
    btnContinuarPago.addEventListener('click', () => {
        const radioSeleccionado = document.querySelector('input[name="membresia"]:checked');
        
        if (!radioSeleccionado) {
            alert('Por favor selecciona un plan de membresía.');
            return;
        }

        planSeleccionado = radioSeleccionado.value;
        
        // Definir precios según el plan
        if (planSeleccionado === '1') {
            precioSeleccionado = 3;
        } else if (planSeleccionado === '2') {
            precioSeleccionado = 5;
        }

        totalPago.textContent = `$${precioSeleccionado}`;

        // Cambiar a vista de pago
        vistaPlan.classList.remove('vista-activa');
        vistaPlan.classList.add('vista-oculta');
        vistaPago.classList.remove('vista-oculta');
        vistaPago.classList.add('vista-activa');
    });

    // SELECCIÓN DE TIPO DE PAGO
    btnTransferencia.addEventListener('click', () => {
        seleccionarTipoPago('transferencia');
    });

    btnEfectivo.addEventListener('click', () => {
        seleccionarTipoPago('efectivo');
    });

    function seleccionarTipoPago(tipo) {
        tipoPagoSeleccionado = tipo;

        // Actualizar botones
        btnTransferencia.classList.remove('activo');
        btnEfectivo.classList.remove('activo');

        if (tipo === 'transferencia') {
            btnTransferencia.classList.add('activo');
            seccionTransferencia.classList.remove('oculto');
            seccionEfectivo.classList.add('oculto');
            errorTipoPago.classList.add('oculto');
        } else {
            btnEfectivo.classList.add('activo');
            seccionEfectivo.classList.remove('oculto');
            seccionTransferencia.classList.add('oculto');
            errorEvidencia.classList.add('oculto');
        }
    }

    // MANEJO DE ARCHIVO
    inputEvidencia.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        
        if (archivo) {
            // Validar que sea imagen
            if (!archivo.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen válido.');
                inputEvidencia.value = '';
                return;
            }

            archivoEvidencia = archivo;
            errorEvidencia.classList.add('oculto');

            // Mostrar preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewEvidencia.innerHTML = `<img src="${e.target.result}" alt="Evidencia de pago">`;
                previewEvidencia.classList.remove('oculto');
            };
            reader.readAsDataURL(archivo);
        }
    });

    // FINALIZAR COMPRA
    btnFinalizarCompra.addEventListener('click', async () => {
        // Validar tipo de pago
        if (!tipoPagoSeleccionado) {
            if (!errorTipoPago.classList.contains('oculto')) {
                errorTipoPago.classList.remove('oculto');
            } else {
                errorTipoPago.classList.remove('oculto');
            }
            return;
        }

        // Validar evidencia si es transferencia
        if (tipoPagoSeleccionado === 'transferencia' && !archivoEvidencia) {
            errorEvidencia.classList.remove('oculto');
            return;
        }

        // Confirmar compra
        if (!confirm('¿Estás seguro de que deseas finalizar la compra?')) {
            return;
        }

        try {
            // Crear objeto con datos de la membresía
            const datos = {
                id_usuario: parseInt(userId),
                id_membresia_tipo: parseInt(planSeleccionado),
                activa: false // Pendiente de aprobación
            };

            console.log('Enviando datos:', datos);

            // Enviar solicitud
            const response = await fetch(BASE_URL + 'usuario-membresia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Membresía creada:', data);

                // Mostrar modal de éxito
                modalExito.classList.remove('oculto');
            } else {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                alert(`Error al procesar el pago: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al procesar el pago. Por favor, intenta de nuevo.');
        }
    });

    // CERRAR MODAL Y REDIRIGIR
    btnCerrarModal.addEventListener('click', () => {
        modalExito.classList.add('oculto');
        window.location.href = '../infousuario.html';
    });

    // RESETEAR FORMULARIO
    function resetearFormulario() {
        tipoPagoSeleccionado = null;
        archivoEvidencia = null;
        btnTransferencia.classList.remove('activo');
        btnEfectivo.classList.remove('activo');
        seccionTransferencia.classList.add('oculto');
        seccionEfectivo.classList.add('oculto');
        errorEvidencia.classList.add('oculto');
        errorTipoPago.classList.add('oculto');
        inputEvidencia.value = '';
        previewEvidencia.classList.add('oculto');
        previewEvidencia.innerHTML = '';
    }
});
