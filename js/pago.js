// BOTONES
const btnTransfer = document.getElementById('btnTransfer');
const btnEfectivo = document.getElementById('btnEfectivo');
const seccionTransferencia = document.getElementById("seccionTransferencia");
const mensajeEfectivo = document.getElementById("mensajeEfectivo");
const btnFinalizar = document.getElementById("btnFinalizar");

// CAMPOS TRANSFERENCIA
const titular = document.getElementById("titular");
const cuenta = document.getElementById("cuenta");
const uploadInput = document.getElementById('uploadInput');
const previewImg = document.getElementById('previewImg');

// VARIABLE PARA SABER QUÉ MÉTODO SE SELECCIONÓ
let metodoPago = "";

// SELECCIONAR TRANSFERENCIA
btnTransfer.onclick = () => {
    metodoPago = "transferencia";
    btnTransfer.classList.add('payment-selected');
    btnEfectivo.classList.remove('payment-selected');
    seccionTransferencia.style.display = "block";
    mensajeEfectivo.style.display = "none";
};

// SELECCIONAR EFECTIVO
btnEfectivo.onclick = () => {
    metodoPago = "efectivo";
    btnEfectivo.classList.add('payment-selected');
    btnTransfer.classList.remove('payment-selected');
    seccionTransferencia.style.display = "none";
    mensajeEfectivo.style.display = "block";
};

// SUBIR IMAGEN
const uploadArea = document.getElementById('uploadArea');
uploadArea.onclick = () => uploadInput.click();

uploadInput.onchange = () => {
    const file = uploadInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            uploadArea.querySelector('i').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
};

// FINALIZAR COMPRA
btnFinalizar.onclick = () => {

    // SI NO SELECCIONÓ NINGÚN MÉTODO
    if (metodoPago === "") {
        alert("Por favor selecciona un método de pago.");
        return;
    }

    // VALIDACIONES PARA TRANSFERENCIA
    if (metodoPago === "transferencia") {

        if (titular.value.trim() === "") {
            alert("Por favor ingresa el nombre del titular.");
            return;
        }

        if (cuenta.value.trim() === "") {
            alert("Por favor ingresa el número de cuenta.");
            return;
        }

        if (!uploadInput.files[0]) {
            alert("Por favor sube la imagen del comprobante de transferencia.");
            return;
        }
    }

    // SI TODO ESTÁ BIEN → MENSAJE DE PAGO EXITOSO
    alert("🎉 Pago exitoso\n¡Gracias por tu compra!");
};
