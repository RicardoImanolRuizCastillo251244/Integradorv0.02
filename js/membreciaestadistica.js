import { BASE_URL } from "./api_url.js";

let graficoMembresias = null;

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    // Cargar estadísticas por defecto (últimos 30 días)
    await cargarEstadisticas();
});

window.cargarEstadisticas = async () => {
    const authToken = localStorage.getItem('authToken');
    const periodo = document.getElementById('selectPeriodo').value;

    try {
        const response = await fetch(BASE_URL + `estadisticas/membresias?periodo=${periodo}d`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const datos = await response.json();
            actualizarEstadisticas(datos);
        } else {
            console.error('Error al cargar estadísticas:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    }
};

function actualizarEstadisticas(datos) {
    // Actualizar cantidades por tipo de membresía
    const oro = datos.oro || datos.membresia_oro || 0;
    const plata = datos.plata || datos.membresia_plata || 0;
    const bronce = datos.bronce || datos.membresia_bronce || 0;

    document.getElementById('cantidadOro').innerText = oro;
    document.getElementById('cantidadPlata').innerText = plata;
    document.getElementById('cantidadBronce').innerText = bronce;

    // Actualizar monto total
    const montoTotal = datos.monto_total || 0;
    document.getElementById('montoTotal').innerText = `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Actualizar gráfico circular
    actualizarGrafico(oro, plata, bronce);
}

function actualizarGrafico(oro, plata, bronce) {
    const ctx = document.getElementById('graficoMembresias').getContext('2d');

    // Destruir gráfico anterior si existe
    if (graficoMembresias) {
        graficoMembresias.destroy();
    }

    // Crear nuevo gráfico
    graficoMembresias = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Membresía Oro', 'Membresía Plata', 'Membresía Bronce'],
            datasets: [{
                data: [oro, plata, bronce],
                backgroundColor: [
                    '#FFD700', // Oro
                    '#C0C0C0', // Plata
                    '#CD7F32'  // Bronce
                ],
                borderColor: [
                    '#FFA500',
                    '#A9A9A9',
                    '#8B4513'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            family: 'Open Sauce One'
                        },
                        padding: 15,
                        color: '#333'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function mostrarError() {
    document.getElementById('cantidadOro').innerText = 'Error';
    document.getElementById('cantidadPlata').innerText = 'Error';
    document.getElementById('cantidadBronce').innerText = 'Error';
    document.getElementById('montoTotal').innerText = 'Error';

    // Mostrar gráfico vacío
    actualizarGrafico(0, 0, 0);
}
