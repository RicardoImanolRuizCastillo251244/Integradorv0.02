import { BASE_URL } from "./api_url.js";

const userId = localStorage.getItem('userId');
const authToken = localStorage.getItem('authToken');

// Variables para almacenar datos
let ventasData = [];

// Cargar datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await cargarEstadisticas();

    // Configurar selector de periodo
    const selectPeriodo = document.getElementById('categoria');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', (e) => {
            filtrarPorPeriodo(e.target.value);
        });
    }
});

// Función para cargar estadísticas del vendedor
async function cargarEstadisticas() {
    if (!userId || !authToken) {
        alert('Debes iniciar sesión para ver estadísticas');
        window.location.href = '../login.html';
        return;
    }

    try {
        // Llamada al endpoint de estadísticas del vendedor
        const response = await fetch(`${BASE_URL}venta/vendedor/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            ventasData = await response.json();
            console.log('Ventas del vendedor:', ventasData);

            // Mostrar estadísticas completas por defecto
            mostrarEstadisticas(ventasData);
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

// Función para filtrar por periodo
function filtrarPorPeriodo(periodo) {
    if (!ventasData || ventasData.length === 0) {
        mostrarEstadisticasVacias();
        return;
    }

    const ahora = new Date();
    let ventasFiltradas = [];

    switch(periodo) {
        case 'Dia':
            // Filtrar ventas de hoy
            ventasFiltradas = ventasData.filter(venta => {
                const fechaVenta = new Date(venta.fechaVenta);
                return fechaVenta.toDateString() === ahora.toDateString();
            });
            break;

        case 'Semana':
            // Filtrar últimos 7 días
            const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
            ventasFiltradas = ventasData.filter(venta => {
                const fechaVenta = new Date(venta.fechaVenta);
                return fechaVenta >= hace7Dias;
            });
            break;

        case 'Mes':
            // Filtrar este mes
            ventasFiltradas = ventasData.filter(venta => {
                const fechaVenta = new Date(venta.fechaVenta);
                return fechaVenta.getMonth() === ahora.getMonth() &&
                       fechaVenta.getFullYear() === ahora.getFullYear();
            });
            break;

        case 'tresMeses':
            // Filtrar últimos 3 meses
            const hace3Meses = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
            ventasFiltradas = ventasData.filter(venta => {
                const fechaVenta = new Date(venta.fechaVenta);
                return fechaVenta >= hace3Meses;
            });
            break;

        default:
            ventasFiltradas = ventasData;
    }

    mostrarEstadisticas(ventasFiltradas);
}

// Función para mostrar estadísticas en pantalla
function mostrarEstadisticas(ventas) {
    if (!ventas || ventas.length === 0) {
        mostrarEstadisticasVacias();
        return;
    }

    // Calcular estadísticas
    const totalVentas = ventas.length;
    const montoTotal = ventas.reduce((sum, venta) => sum + (venta.precioTotal || 0), 0);

    // Obtener publicaciones únicas
    const publicacionesUnicas = new Set(ventas.map(v => v.idPublicacion));
    const totalPublicaciones = publicacionesUnicas.size;

    // Actualizar UI
    const ventasElement = document.querySelector('.color-ventas .dato-numero');
    const publicacionesElement = document.querySelector('.color-publicaciones .dato-numero');
    const montoElement = document.querySelector('.valor-monto');

    if (ventasElement) ventasElement.textContent = totalVentas.toString().padStart(2, '0');
    if (publicacionesElement) publicacionesElement.textContent = totalPublicaciones.toString().padStart(2, '0');
    if (montoElement) montoElement.textContent = `$${montoTotal.toFixed(2)}`;

    // Calcular producto más vendido para la gráfica
    const productosPorCategoria = {};
    ventas.forEach(venta => {
        const categoria = venta.categoria || 'Sin categoría';
        if (!productosPorCategoria[categoria]) {
            productosPorCategoria[categoria] = 0;
        }
        productosPorCategoria[categoria] += venta.cantidadVendida || 0;
    });

    console.log('Productos por categoría:', productosPorCategoria);
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