import { BASE_URL } from "./api_url.js";

let tipoSeleccionado = 'ventas';
let historialReportes = [];

document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    // Evento para mostrar/ocultar fechas personalizadas
    document.getElementById('selectPeriodo').addEventListener('change', function() {
        const fechasDiv = document.getElementById('fechasPersonalizadas');
        fechasDiv.style.display = this.value === 'custom' ? 'block' : 'none';
    });

    cargarHistorial();
});

window.seleccionarTipo = (tipo) => {
    tipoSeleccionado = tipo;
    
    // Actualizar botones activos
    document.querySelectorAll('.tipo-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tipo === tipo) {
            btn.classList.add('active');
        }
    });
};

window.generarVistaPrevia = async () => {
    const authToken = localStorage.getItem('authToken');
    const vistaPrevia = document.getElementById('vistaPrevia');
    
    vistaPrevia.innerHTML = '<div class="cargando"><i class="fa-solid fa-spinner fa-spin"></i><p>Generando vista previa...</p></div>';

    const periodo = obtenerPeriodo();
    
    try {
        let endpoint = '';
        let titulo = '';
        
        switch(tipoSeleccionado) {
            case 'ventas':
                endpoint = `estadisticas/ventas?periodo=${periodo}d`;
                titulo = 'Reporte de Ventas';
                break;
            case 'usuarios':
                endpoint = 'usuarios';
                titulo = 'Reporte de Usuarios';
                break;
            case 'productos':
                endpoint = 'productos';
                titulo = 'Reporte de Productos';
                break;
            case 'membresias':
                endpoint = 'estadisticas/membresias?periodo=' + periodo + 'd';
                titulo = 'Reporte de Membresías';
                break;
            case 'quejas':
                endpoint = 'quejas';
                titulo = 'Reporte de Quejas';
                break;
        }

        const response = await fetch(BASE_URL + endpoint, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const datos = await response.json();
            renderizarVistaPrevia(datos, titulo);
        } else {
            vistaPrevia.innerHTML = '<div class="error-preview"><i class="fa-solid fa-exclamation-triangle"></i><p>Error al cargar datos</p></div>';
        }
    } catch (error) {
        console.error('Error:', error);
        vistaPrevia.innerHTML = '<div class="error-preview"><i class="fa-solid fa-exclamation-triangle"></i><p>Error de conexión</p></div>';
    }
};

function renderizarVistaPrevia(datos, titulo) {
    const vistaPrevia = document.getElementById('vistaPrevia');
    const periodo = document.getElementById('selectPeriodo').options[document.getElementById('selectPeriodo').selectedIndex].text;
    
    let html = `
        <div class="preview-header">
            <h4>${titulo}</h4>
            <p class="preview-periodo">Periodo: ${periodo}</p>
        </div>
        <div class="preview-body">
    `;

    if (tipoSeleccionado === 'ventas') {
        const totalProductos = datos.total_productos_vendidos || datos.totalProductos || 0;
        const montoTotal = datos.monto_total || datos.montoTotal || 0;
        
        html += `
            <div class="row">
                <div class="col-md-6">
                    <div class="preview-card">
                        <p class="preview-label">Total Productos Vendidos</p>
                        <p class="preview-value">${totalProductos}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="preview-card">
                        <p class="preview-label">Monto Total Generado</p>
                        <p class="preview-value">$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (tipoSeleccionado === 'usuarios') {
        const total = datos.length || 0;
        const activos = datos.filter(u => u.estado === 'activo' || u.activo).length;
        const inactivos = total - activos;
        
        html += `
            <div class="row">
                <div class="col-md-4">
                    <div class="preview-card">
                        <p class="preview-label">Total Usuarios</p>
                        <p class="preview-value">${total}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="preview-card">
                        <p class="preview-label">Activos</p>
                        <p class="preview-value" style="color: #4d9d30;">${activos}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="preview-card">
                        <p class="preview-label">Inactivos</p>
                        <p class="preview-value" style="color: #c00000;">${inactivos}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (tipoSeleccionado === 'productos') {
        const total = datos.length || 0;
        const activos = datos.filter(p => p.estado === 'activo' || p.activo).length;
        const inactivos = datos.filter(p => p.estado === 'inactivo').length;
        const pendientes = datos.filter(p => p.estado === 'pendiente').length;
        
        html += `
            <div class="row">
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Total</p>
                        <p class="preview-value">${total}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Activos</p>
                        <p class="preview-value" style="color: #4d9d30;">${activos}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Inactivos</p>
                        <p class="preview-value" style="color: #c00000;">${inactivos}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Pendientes</p>
                        <p class="preview-value" style="color: #ff9800;">${pendientes}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (tipoSeleccionado === 'membresias') {
        const oro = datos.membresias_oro || datos.oro || 0;
        const plata = datos.membresias_plata || datos.plata || 0;
        const bronce = datos.membresias_bronce || datos.bronce || 0;
        const total = oro + plata + bronce;
        
        html += `
            <div class="row">
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Total</p>
                        <p class="preview-value">${total}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Oro</p>
                        <p class="preview-value" style="color: #FFD700;">${oro}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Plata</p>
                        <p class="preview-value" style="color: #C0C0C0;">${plata}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="preview-card">
                        <p class="preview-label">Bronce</p>
                        <p class="preview-value" style="color: #CD7F32;">${bronce}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (tipoSeleccionado === 'quejas') {
        const total = datos.length || 0;
        const pendientes = datos.filter(q => q.estado === 'pendiente' || !q.estado).length;
        const resueltas = datos.filter(q => q.estado === 'resuelta' || q.estado === 'aceptada').length;
        
        html += `
            <div class="row">
                <div class="col-md-4">
                    <div class="preview-card">
                        <p class="preview-label">Total Quejas</p>
                        <p class="preview-value">${total}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="preview-card">
                        <p class="preview-label">Pendientes</p>
                        <p class="preview-value" style="color: #ff9800;">${pendientes}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="preview-card">
                        <p class="preview-label">Resueltas</p>
                        <p class="preview-value" style="color: #4d9d30;">${resueltas}</p>
                    </div>
                </div>
            </div>
        `;
    }

    html += `</div>`;
    vistaPrevia.innerHTML = html;
}

window.generarReporte = () => {
    const formato = document.getElementById('selectFormato').value;
    const periodo = document.getElementById('selectPeriodo').options[document.getElementById('selectPeriodo').selectedIndex].text;
    
    // Guardar en historial
    const reporte = {
        fecha: new Date().toLocaleString('es-ES'),
        tipo: tipoSeleccionado.charAt(0).toUpperCase() + tipoSeleccionado.slice(1),
        periodo: periodo,
        formato: formato.toUpperCase()
    };
    
    historialReportes.unshift(reporte);
    localStorage.setItem('historialReportes', JSON.stringify(historialReportes));
    
    // Actualizar tabla
    renderizarHistorial();
    
    // Simular descarga
    alert(`Generando reporte de ${reporte.tipo} en formato ${reporte.formato}...\n\nEl reporte se descargará en unos momentos.`);
    
    // En producción, aquí se haría la llamada real al backend para generar el archivo
    // window.open(BASE_URL + `reportes/generar?tipo=${tipoSeleccionado}&periodo=${periodo}&formato=${formato}`, '_blank');
};

function cargarHistorial() {
    const historial = localStorage.getItem('historialReportes');
    if (historial) {
        historialReportes = JSON.parse(historial);
        renderizarHistorial();
    }
}

function renderizarHistorial() {
    const tbody = document.getElementById('tablaHistorial');
    
    if (historialReportes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay reportes generados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    historialReportes.slice(0, 10).forEach((r, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${r.fecha}</td>
            <td><span class="badge-tipo badge-${r.tipo.toLowerCase()}">${r.tipo}</span></td>
            <td>${r.periodo}</td>
            <td><span class="badge-formato">${r.formato}</span></td>
            <td class="text-center">
                <button class="btn-descargar-historial" onclick="descargarHistorial(${index})">
                    <i class="fa-solid fa-download"></i> Descargar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.descargarHistorial = (index) => {
    const reporte = historialReportes[index];
    alert(`Descargando reporte de ${reporte.tipo} (${reporte.formato})...`);
    // En producción: window.open(reporte.url, '_blank');
};

function obtenerPeriodo() {
    const selectPeriodo = document.getElementById('selectPeriodo');
    const valorPeriodo = selectPeriodo.value;
    
    if (valorPeriodo === 'custom') {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        if (!fechaInicio || !fechaFin) {
            alert('Por favor selecciona ambas fechas.');
            return 30; // Default
        }
        
        const diff = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));
        return diff;
    }
    
    return parseInt(valorPeriodo);
}
