// BOTONES
const btnTransfer = document.getElementById('btnTransfer');
const btnEfectivo = document.getElementById('btnEfectivo');
const seccionTransferencia = document.getElementById("seccionTransferencia");

function seleccionar(btn) {
    btnTransfer.classList.remove('payment-selected');
    btnEfectivo.classList.remove('payment-selected');
    btn.classList.add('payment-selected');
}

// MOSTRAR / OCULTAR CAMPOS
btnTransfer.onclick = () => {
    seleccionar(btnTransfer);
    seccionTransferencia.style.display = "block";
};

btnEfectivo.onclick = () => {
    seleccionar(btnEfectivo);
    seccionTransferencia.style.display = "none";
};

// SUBIR IMAGEN
const uploadArea = document.getElementById('uploadArea');
const uploadInput = document.getElementById('uploadInput');
const previewImg = document.getElementById('previewImg');

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
