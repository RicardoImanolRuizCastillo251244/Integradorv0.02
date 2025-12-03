import { BASE_URL } from "./api_url.js";

const userId = localStorage.getItem('userId');
const authToken = localStorage.getItem('authToken');

// Variables para almacenar datos
let todasLasVentas = [];

// Cargar datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    if (!userId || !authToken) {
        alert('Debes iniciar sesión para ver estadísticas');
        window.location.href = '../login.html';
        return;
    }

    // Cargar todas las ventas del vendedor
    await cargarTodasLasVentas();

    // Configurar selector de periodo
    const selectPeriodo = document.getElementById('categoria');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', (e) => {
            const periodo = e.target.value;
            if (periodo) {
                filtrarPorPeriodo(periodo);
            }
        });
    }
});

// Función para cargar TODAS las ventas del vendedor
async function cargarTodasLasVentas() {
    try {
        const response = await fetch(`${BASE_URL}venta/vendedor/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            todasLasVentas = await response.json();
            console.log('Todas las ventas del vendedor:', todasLasVentas);

            // Mostrar todas las ventas por defecto
            mostrarEstadisticas(todasLasVentas);
        } else if (response.status === 401) {
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            window.location.href = '../login.html';
        } else {
            console.error('Error al cargar estadísticas:', response.status);
            mostrarEstadisticasVacias();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarEstadisticasVacias();
    }
}

// Función para filtrar por periodo (igual que en admin)
function filtrarPorPeriodo(periodo) {
    if (!todasLasVentas || todasLasVentas.length === 0) {
        mostrarEstadisticasVacias();
        return;
    }

    const fechaLimite = new Date();
    let ventasFiltradas = [];

    switch(periodo) {
        case 'Dia':
            // Filtrar ventas de hoy
            ventasFiltradas = todasLasVentas.filter(venta => {
                const fechaVenta = new Date(venta.fecha_venta || venta.fechaVenta);
                return fechaVenta.toDateString() === fechaLimite.toDateString();
            });
            break;

        case 'Semana':
            // Filtrar últimos 7 días
            fechaLimite.setDate(fechaLimite.getDate() - 7);
            ventasFiltradas = todasLasVentas.filter(venta => {
                const fechaVenta = new Date(venta.fecha_venta || venta.fechaVenta);
                return fechaVenta >= fechaLimite;
            });
            break;

        case 'Mes':
            // Filtrar últimos 30 días
            fechaLimite.setDate(fechaLimite.getDate() - 30);
            ventasFiltradas = todasLasVentas.filter(venta => {
                const fechaVenta = new Date(venta.fecha_venta || venta.fechaVenta);
                return fechaVenta >= fechaLimite;
            });
            break;

        case 'tresMeses':
            // Filtrar últimos 90 días
            fechaLimite.setDate(fechaLimite.getDate() - 90);
            ventasFiltradas = todasLasVentas.filter(venta => {
                const fechaVenta = new Date(venta.fecha_venta || venta.fechaVenta);
                return fechaVenta >= fechaLimite;
            });
            break;

        default:
            ventasFiltradas = todasLasVentas;
    }

    console.log(`Ventas filtradas para ${periodo}:`, ventasFiltradas);
    mostrarEstadisticas(ventasFiltradas);
}

// Función para mostrar estadísticas en pantalla (igual que admin)
function mostrarEstadisticas(ventas) {
    if (!ventas || ventas.length === 0) {
        mostrarEstadisticasVacias();
        return;
    }

    // Calcular estadísticas
    const totalVentas = ventas.length;
    
    // Calcular monto total (compatible con diferentes nombres de campo)
    const montoTotal = ventas.reduce((sum, venta) => {
        const monto = venta.monto_total || venta.precioTotal || venta.total || 0;
        return sum + parseFloat(monto);
    }, 0);

    // Obtener publicaciones únicas
    const publicacionesUnicas = new Set(
        ventas.map(v => v.idPublicacion || v.id_publicacion).filter(id => id)
    );
    const totalPublicaciones = publicacionesUnicas.size;

    // Actualizar UI
    const ventasElement = document.querySelector('.color-ventas .dato-numero');
    const publicacionesElement = document.querySelector('.color-publicaciones .dato-numero');
    const montoElement = document.querySelector('.valor-monto');

    if (ventasElement) {
        ventasElement.textContent = totalVentas.toString().padStart(2, '0');
    }
    if (publicacionesElement) {
        publicacionesElement.textContent = totalPublicaciones.toString().padStart(2, '0');
    }
    if (montoElement) {
        montoElement.textContent = `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    console.log('Estadísticas mostradas:', { totalVentas, totalPublicaciones, montoTotal });
}

// Función para mostrar estadísticas vacías
function mostrarEstadisticasVacias() {
    const ventasElement = document.querySelector('.color-ventas .dato-numero');
    const publicacionesElement = document.querySelector('.color-publicaciones .dato-numero');
    const montoElement = document.querySelector('.valor-monto');

    if (ventasElement) ventasElement.textContent = '00';
    if (publicacionesElement) publicacionesElement.textContent = '00';
    if (montoElement) montoElement.textContent = '$0.00';
}

// Botón regresar
const returnFunction = document.getElementById("return");
if (returnFunction) {
    returnFunction.addEventListener("click", () => {
        window.location.href = '../../index.html';
    });
}