import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    cargarConfiguraciones();
});

async function cargarConfiguraciones() {
    const authToken = localStorage.getItem('authToken');

    try {
        // Intentar cargar configuraciones desde el servidor
        const response = await fetch(BASE_URL + 'configuracion', {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const config = await response.json();
            aplicarConfiguraciones(config);
        } else {
            // Si no hay endpoint, cargar desde localStorage
            cargarConfiguracionesLocal();
        }
    } catch (error) {
        console.error('Error al cargar configuraciones:', error);
        cargarConfiguracionesLocal();
    }
}

function cargarConfiguracionesLocal() {
    const config = JSON.parse(localStorage.getItem('configuracionAdmin')) || {};
    aplicarConfiguraciones(config);
}

function aplicarConfiguraciones(config) {
    // Configuración general
    if (config.nombrePlataforma) document.getElementById('nombrePlataforma').value = config.nombrePlataforma;
    if (config.descripcionPlataforma) document.getElementById('descripcionPlataforma').value = config.descripcionPlataforma;
    if (config.correoContacto) document.getElementById('correoContacto').value = config.correoContacto;
    if (config.telefonoContacto) document.getElementById('telefonoContacto').value = config.telefonoContacto;

    // Comisiones
    if (config.comisionVenta) document.getElementById('comisionVenta').value = config.comisionVenta;
    if (config.tarifaEnvio) document.getElementById('tarifaEnvio').value = config.tarifaEnvio;

    // Membresías
    if (config.precioOro) document.getElementById('precioOro').value = config.precioOro;
    if (config.duracionOro) document.getElementById('duracionOro').value = config.duracionOro;
    if (config.productosOro) document.getElementById('productosOro').value = config.productosOro;

    if (config.precioPlata) document.getElementById('precioPlata').value = config.precioPlata;
    if (config.duracionPlata) document.getElementById('duracionPlata').value = config.duracionPlata;
    if (config.productosPlata) document.getElementById('productosPlata').value = config.productosPlata;

    if (config.precioBronce) document.getElementById('precioBronce').value = config.precioBronce;
    if (config.duracionBronce) document.getElementById('duracionBronce').value = config.duracionBronce;
    if (config.productosBronce) document.getElementById('productosBronce').value = config.productosBronce;

    // Seguridad
    if (config.requiereVerificacion !== undefined) document.getElementById('requiereVerificacion').checked = config.requiereVerificacion;
    if (config.moderacionProductos !== undefined) document.getElementById('moderacionProductos').checked = config.moderacionProductos;
    if (config.permitirRegistro !== undefined) document.getElementById('permitirRegistro').checked = config.permitirRegistro;
    if (config.mantenimiento !== undefined) document.getElementById('mantenimiento').checked = config.mantenimiento;

    if (config.maxIntentos) document.getElementById('maxIntentos').value = config.maxIntentos;
    if (config.tiempoBloqueo) document.getElementById('tiempoBloqueo').value = config.tiempoBloqueo;
    if (config.maxTamanoImagen) document.getElementById('maxTamanoImagen').value = config.maxTamanoImagen;
    if (config.maxImagenesProducto) document.getElementById('maxImagenesProducto').value = config.maxImagenesProducto;

    // Estado de respaldo
    if (config.ultimoRespaldo) {
        document.getElementById('ultimoRespaldo').innerText = config.ultimoRespaldo;
        document.getElementById('estadoRespaldo').innerText = 'Completado';
        document.getElementById('estadoRespaldo').className = 'badge-estado estado-ok';
    }
}

window.cambiarTab = (tab) => {
    // Desactivar todas las tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));

    // Activar tab seleccionada
    switch(tab) {
        case 'general':
            document.querySelectorAll('.tab')[0].classList.add('active');
            document.getElementById('tabGeneral').classList.add('active-tab');
            break;
        case 'membresias':
            document.querySelectorAll('.tab')[1].classList.add('active');
            document.getElementById('tabMembresias').classList.add('active-tab');
            break;
        case 'seguridad':
            document.querySelectorAll('.tab')[2].classList.add('active');
            document.getElementById('tabSeguridad').classList.add('active-tab');
            break;
    }
};

window.guardarGeneral = async () => {
    const config = {
        nombrePlataforma: document.getElementById('nombrePlataforma').value,
        descripcionPlataforma: document.getElementById('descripcionPlataforma').value,
        correoContacto: document.getElementById('correoContacto').value,
        telefonoContacto: document.getElementById('telefonoContacto').value
    };

    await guardarConfiguracion(config, 'Configuración general guardada correctamente.');
};

window.guardarComisiones = async () => {
    const config = {
        comisionVenta: parseFloat(document.getElementById('comisionVenta').value),
        tarifaEnvio: parseFloat(document.getElementById('tarifaEnvio').value)
    };

    await guardarConfiguracion(config, 'Comisiones guardadas correctamente.');
};

window.guardarMembresia = async (tipo) => {
    const config = {
        [`precio${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`]: parseFloat(document.getElementById(`precio${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).value),
        [`duracion${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`]: parseInt(document.getElementById(`duracion${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).value),
        [`productos${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`]: parseInt(document.getElementById(`productos${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).value)
    };

    await guardarConfiguracion(config, `Membresía ${tipo} actualizada correctamente.`);
};

window.guardarSeguridad = async () => {
    const config = {
        requiereVerificacion: document.getElementById('requiereVerificacion').checked,
        moderacionProductos: document.getElementById('moderacionProductos').checked,
        permitirRegistro: document.getElementById('permitirRegistro').checked,
        mantenimiento: document.getElementById('mantenimiento').checked,
        maxIntentos: parseInt(document.getElementById('maxIntentos').value),
        tiempoBloqueo: parseInt(document.getElementById('tiempoBloqueo').value),
        maxTamanoImagen: parseInt(document.getElementById('maxTamanoImagen').value),
        maxImagenesProducto: parseInt(document.getElementById('maxImagenesProducto').value)
    };

    await guardarConfiguracion(config, 'Configuración de seguridad guardada correctamente.');
};

async function guardarConfiguracion(config, mensajeExito) {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + 'configuracion', {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            alert(mensajeExito);
        } else {
            // Si no hay endpoint, guardar en localStorage
            guardarConfiguracionLocal(config, mensajeExito);
        }
    } catch (error) {
        console.error('Error:', error);
        guardarConfiguracionLocal(config, mensajeExito);
    }
}

function guardarConfiguracionLocal(config, mensajeExito) {
    const configActual = JSON.parse(localStorage.getItem('configuracionAdmin')) || {};
    const nuevaConfig = { ...configActual, ...config };
    localStorage.setItem('configuracionAdmin', JSON.stringify(nuevaConfig));
    alert(mensajeExito);
}

window.generarRespaldo = async () => {
    const authToken = localStorage.getItem('authToken');

    if (!confirm('¿Estás seguro de que deseas generar un respaldo completo de la base de datos?')) {
        return;
    }

    try {
        const response = await fetch(BASE_URL + 'admin/respaldo/generar', {
            method: 'POST',
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `respaldo_${new Date().toISOString().split('T')[0]}.sql`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            const ahora = new Date().toLocaleString('es-ES');
            document.getElementById('ultimoRespaldo').innerText = ahora;
            document.getElementById('estadoRespaldo').innerText = 'Completado';
            document.getElementById('estadoRespaldo').className = 'badge-estado estado-ok';

            // Guardar fecha en configuración
            guardarConfiguracionLocal({ ultimoRespaldo: ahora }, '');

            alert('Respaldo generado correctamente.');
        } else {
            alert('Generando respaldo simulado...\n\nEn producción, esto descargaría un archivo .sql con la base de datos completa.');
            
            const ahora = new Date().toLocaleString('es-ES');
            document.getElementById('ultimoRespaldo').innerText = ahora;
            document.getElementById('estadoRespaldo').innerText = 'Completado';
            document.getElementById('estadoRespaldo').className = 'badge-estado estado-ok';
            guardarConfiguracionLocal({ ultimoRespaldo: ahora }, '');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar respaldo. Inténtalo nuevamente.');
    }
};

window.restaurarRespaldo = () => {
    if (!confirm('¿Estás seguro de que deseas restaurar la base de datos desde un respaldo?\n\nEsta acción sobrescribirá todos los datos actuales.')) {
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sql,.zip';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const authToken = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('respaldo', file);

        try {
            const response = await fetch(BASE_URL + 'admin/respaldo/restaurar', {
                method: 'POST',
                headers: { 'Authorization': authToken },
                body: formData
            });

            if (response.ok) {
                alert('Base de datos restaurada correctamente. Se recomienda reiniciar el sistema.');
            } else {
                alert('Archivo de respaldo cargado (simulación).\n\nEn producción, esto restauraría la base de datos desde el archivo .sql seleccionado.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al restaurar respaldo.');
        }
    };

    input.click();
};
