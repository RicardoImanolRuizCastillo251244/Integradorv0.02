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
        console.log('Cargando ventas del vendedor:', userId);
        console.log('URL:', `${BASE_URL}venta/vendedor/${userId}`);
        
        const response = await fetch(`${BASE_URL}venta/vendedor/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Datos recibidos del servidor:', data);
            todasLasVentas = Array.isArray(data) ? data : [];
            
            // Mostrar todas las ventas por defecto
            mostrarEstadisticas(todasLasVentas);
        } else if (response.status === 401) {
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            window.location.href = '../login.html';
        } else {
            const errorText = await response.text();
            console.error('Error al cargar estadísticas:', response.status, errorText);
            mostrarEstadisticasVacias();
        }
    } catch (error) {
        console.error('Error de red completo:', error);
        mostrarEstadisticasVacias();
    }
}

// Función para filtrar por periodo (igual que en admin)
function filtrarPorPeriodo(periodo) {
    console.log('Filtrando por periodo:', periodo);
    
    if (!todasLasVentas || todasLasVentas.length === 0) {
        console.log('No hay ventas para filtrar');
        mostrarEstadisticasVacias();
        return;
    }

    const fechaLimite = new Date();
    let ventasFiltradas = [];

    switch(periodo) {
        case 'Dia':
            // Filtrar ventas de hoy
            ventasFiltradas = todasLasVentas.filter(venta => {
                try {
                    const fechaVenta = new Date(venta.fechaVenta || venta.fecha_venta);
                    return fechaVenta.toDateString() === fechaLimite.toDateString();
                } catch (e) {
                    console.error('Error al procesar fecha:', e);
                    return false;
                }
            });
            break;

        case 'Semana':
            // Filtrar últimos 7 días
            fechaLimite.setDate(fechaLimite.getDate() - 7);
            ventasFiltradas = todasLasVentas.filter(venta => {
                try {
                    const fechaVenta = new Date(venta.fechaVenta || venta.fecha_venta);
                    return fechaVenta >= fechaLimite;
                } catch (e) {
                    console.error('Error al procesar fecha:', e);
                    return false;
                }
            });
            break;

        case 'Mes':
            // Filtrar últimos 30 días
            fechaLimite.setDate(fechaLimite.getDate() - 30);
            ventasFiltradas = todasLasVentas.filter(venta => {
                try {
                    const fechaVenta = new Date(venta.fechaVenta || venta.fecha_venta);
                    return fechaVenta >= fechaLimite;
                } catch (e) {
                    console.error('Error al procesar fecha:', e);
                    return false;
                }
            });
            break;

        case 'tresMeses':
            // Filtrar últimos 90 días
            fechaLimite.setDate(fechaLimite.getDate() - 90);
            ventasFiltradas = todasLasVentas.filter(venta => {
                try {
                    const fechaVenta = new Date(venta.fechaVenta || venta.fecha_venta);
                    return fechaVenta >= fechaLimite;
                } catch (e) {
                    console.error('Error al procesar fecha:', e);
                    return false;
                }
            });
            break;

        default:
            ventasFiltradas = todasLasVentas;
    }

    console.log(`Ventas filtradas para ${periodo}:`, ventasFiltradas.length);
    mostrarEstadisticas(ventasFiltradas);
}

// Función para mostrar estadísticas en pantalla (igual que admin)
function mostrarEstadisticas(ventas) {
    console.log('Mostrando estadísticas para:', ventas);
    
    if (!ventas || ventas.length === 0) {
        console.log('No hay ventas para mostrar');
        mostrarEstadisticasVacias();
        return;
    }

    // Calcular estadísticas
    const totalVentas = ventas.length;
    
    // Calcular monto total - intentar con todos los posibles nombres de campo
    const montoTotal = ventas.reduce((sum, venta) => {
        const monto = venta.precioTotal || venta.precio_total || venta.total || 0;
        console.log('Monto de venta individual:', monto);
        return sum + parseFloat(monto || 0);
    }, 0);

    // Obtener publicaciones únicas
    const publicacionesUnicas = new Set();
    ventas.forEach(v => {
        const id = v.idPublicacion || v.id_publicacion;
        if (id) publicacionesUnicas.add(id);
    });
    const totalPublicaciones = publicacionesUnicas.size;

    console.log('Resultados calculados:', { 
        totalVentas, 
        totalPublicaciones, 
        montoTotal 
    });

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