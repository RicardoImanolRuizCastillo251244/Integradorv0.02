import { BASE_URL } from "./api_url.js";

let periodoActual = 7;

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    // Cargar estadísticas por defecto (últimos 7 días)
    await cargarEstadisticas(7);
});

window.cargarEstadisticas = async (dias) => {
    periodoActual = dias;
    const authToken = localStorage.getItem('authToken');
    
    // Actualizar texto del dropdown
    const periodos = {
        7: 'Últimos 7 días',
        30: 'Último mes',
        180: 'Últimos 6 meses',
        365: 'Último año'
    };
    document.getElementById('dropdownPeriodo').innerText = periodos[dias] || `Últimos ${dias} días`;

    try {
        const response = await fetch(BASE_URL + `venta`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const todasVentas = await response.json();
            
            // Filtrar ventas por periodo
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            
            const ventasFiltradas = todasVentas.filter(v => {
                const fechaVenta = new Date(v.fecha_venta || v.fecha);
                return fechaVenta >= fechaLimite;
            });
            
            // Calcular estadísticas
            const datos = {
                total_productos: ventasFiltradas.reduce((sum, v) => sum + (parseInt(v.cantidad || 0)), 0),
                monto_total: ventasFiltradas.reduce((sum, v) => sum + (parseFloat(v.monto_total || v.total || 0)), 0)
            };
            
            actualizarMetricas(datos);
        } else {
            console.error('Error al cargar estadísticas:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    }
};

function actualizarMetricas(datos) {
    // Actualizar total de productos vendidos
    const totalProductos = datos.total_productos || 0;
    document.getElementById('totalProductos').innerText = totalProductos;

    // Actualizar monto total
    const montoTotal = datos.monto_total || 0;
    document.getElementById('montoTotal').innerText = `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mostrarError() {
    document.getElementById('totalProductos').innerText = 'Error';
    document.getElementById('montoTotal').innerText = 'Error';
}
