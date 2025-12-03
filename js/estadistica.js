import { BASE_URL } from "./api_url.js";

const userId = localStorage.getItem('userId');
const authToken = localStorage.getItem('authToken');

// Variables globales
let todasLasVentas = [];
let graficoVentasDiarias = null;

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
        // Establecer valor por defecto
        selectPeriodo.value = "Semana"; 
        
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
            const data = await response.json();
            todasLasVentas = Array.isArray(data) ? data : [];
            
            // Cargar por defecto la última semana
            filtrarPorPeriodo("Semana");
        } else if (response.status === 401) {
            alert('Tu sesión ha expirado.');
            window.location.href = '../login.html';
        } else {
            console.error('Error al cargar estadísticas');
            mostrarEstadisticasVacias();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarEstadisticasVacias();
    }
}

// Lógica de filtrado unificada con la lógica visual del Admin
function filtrarPorPeriodo(periodoSeleccionado) {
    if (!todasLasVentas || todasLasVentas.length === 0) {
        mostrarEstadisticasVacias();
        return;
    }

    const fechaLimite = new Date();
    let diasParaGrafica = 7; // Por defecto 7 días

    // Determinar cuántos días atrás vamos a mirar según el select
    switch(periodoSeleccionado) {
        case 'Dia':
            diasParaGrafica = 1;
            break;
        case 'Semana':
            diasParaGrafica = 7;
            break;
        case 'Mes':
            diasParaGrafica = 30;
            break;
        case 'tresMeses':
            diasParaGrafica = 90;
            break;
        default:
            diasParaGrafica = 7;
    }

    // Configurar fecha límite restando días a hoy
    if (periodoSeleccionado !== 'Dia') {
        fechaLimite.setDate(fechaLimite.getDate() - diasParaGrafica);
    } else {
        // Si es "Hoy", queremos desde el inicio del día
        fechaLimite.setHours(0,0,0,0);
    }

    // Filtrar el array de ventas
    const ventasFiltradas = todasLasVentas.filter(venta => {
        const fechaVenta = procesarFecha(venta.fecha_venta || venta.fechaVenta || venta.fecha);
        return fechaVenta >= fechaLimite;
    });

    // Actualizar Tarjetas de Texto
    actualizarMetricasTexto(ventasFiltradas);

    // Generar la Gráfica (Lógica traída del Admin)
    generarGraficoVentasDiarias(ventasFiltradas, diasParaGrafica);
}

// Función auxiliar para normalizar fechas (Maneja arrays [y,m,d] y strings ISO)
function procesarFecha(fechaInput) {
    if (Array.isArray(fechaInput)) {
        return new Date(
            fechaInput[0],
            fechaInput[1] - 1, // Mes en JS es 0-11
            fechaInput[2],
            fechaInput[3] || 0,
            fechaInput[4] || 0
        );
    }
    return new Date(fechaInput);
}

function actualizarMetricasTexto(ventas) {
    const totalVentas = ventas.length;
    
    const montoTotal = ventas.reduce((sum, venta) => {
        const monto = venta.precioTotal || venta.precio_total || venta.total || 0;
        return sum + parseFloat(monto || 0);
    }, 0);

    const publicacionesUnicas = new Set();
    ventas.forEach(v => {
        const id = v.idPublicacion || v.id_publicacion || v.producto?.id;
        if (id) publicacionesUnicas.add(id);
    });

    // Actualizar DOM
    const ventasElement = document.querySelector('.color-ventas .dato-numero');
    const publicacionesElement = document.querySelector('.color-publicaciones .dato-numero');
    const montoElement = document.querySelector('.valor-monto');

    if (ventasElement) ventasElement.textContent = totalVentas.toString().padStart(2, '0');
    if (publicacionesElement) publicacionesElement.textContent = publicacionesUnicas.size.toString().padStart(2, '0');
    if (montoElement) montoElement.textContent = `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ==========================================
// LÓGICA DE GRÁFICA (Adaptada del Admin)
// ==========================================
function generarGraficoVentasDiarias(ventas, dias) {
    const canvas = document.getElementById('graficoVentasDiarias');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destruir gráfico anterior si existe
    if (graficoVentasDiarias) {
        graficoVentasDiarias.destroy();
    }

    // 1. Preparar estructura de datos para la gráfica (llenar días vacíos con 0)
    const ventasPorDia = {};
    const fechaInicio = new Date();
    
    // Si es "Dia" (Hoy), solo mostramos horas o un solo punto, pero para consistencia
    // con el admin, si son N días, retrocedemos N días.
    if (dias === 1) {
        fechaInicio.setHours(0,0,0,0);
        // Para "Hoy" podríamos mostrar horas, pero simplificaremos mostrando el acumulado del día
        const fechaStr = fechaInicio.toISOString().split('T')[0];
        ventasPorDia[fechaStr] = 0;
    } else {
        fechaInicio.setDate(fechaInicio.getDate() - dias);
        // Inicializar todos los días del rango con 0
        for (let i = 1; i <= dias; i++) { // Ajuste para incluir hasta hoy
            const fecha = new Date(fechaInicio);
            fecha.setDate(fecha.getDate() + i);
            const fechaStr = fecha.toISOString().split('T')[0];
            ventasPorDia[fechaStr] = 0;
        }
    }

    // 2. Llenar con datos reales
    ventas.forEach(venta => {
        const fechaVenta = procesarFecha(venta.fecha_venta || venta.fechaVenta || venta.fecha);
        const fechaStr = fechaVenta.toISOString().split('T')[0];
        
        // Sumar al día correspondiente si está dentro del rango
        if (ventasPorDia.hasOwnProperty(fechaStr)) {
            const monto = parseFloat(venta.precio_total || venta.precioTotal || venta.total || 0);
            ventasPorDia[fechaStr] += monto;
        } else if (dias === 1 && fechaStr === new Date().toISOString().split('T')[0]) {
             // Caso especial para filtro "Hoy"
             const monto = parseFloat(venta.precio_total || venta.precioTotal || venta.total || 0);
             const keyHoy = Object.keys(ventasPorDia)[0];
             if(keyHoy) ventasPorDia[keyHoy] += monto;
        }
    });

    // 3. Preparar etiquetas y datos para Chart.js
    const labels = Object.keys(ventasPorDia).map(fecha => {
        const [, month, day] = fecha.split('-');
        return `${day}/${month}`;
    });
    const datos = Object.values(ventasPorDia);

    // 4. Crear el gráfico
    graficoVentasDiarias = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: datos,
                borderColor: '#fc4b08', // Tu color naranja corporativo
                backgroundColor: 'rgba(252, 75, 8, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fc4b08',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#333' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    callbacks: {
                        label: function(context) {
                            return 'Ventas: $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value,
                        color: '#666'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: { color: '#666' },
                    grid: { display: false }
                }
            }
        }
    });
}

function mostrarEstadisticasVacias() {
    actualizarMetricasTexto([]);
    // Si falla, mostramos gráfico vacío
    const canvas = document.getElementById('graficoVentasDiarias');
    if (canvas && !graficoVentasDiarias) {
        // Crear un gráfico vacío visualmente
        graficoVentasDiarias = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: { plugins: { title: { display: true, text: 'Sin datos disponibles' }}}
        });
    }
}

// Botón regresar
const returnFunction = document.getElementById("return");
if (returnFunction) {
    returnFunction.addEventListener("click", () => {
        window.location.href = '../../index.html';
    });
}