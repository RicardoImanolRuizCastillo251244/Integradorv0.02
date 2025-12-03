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
        // Obtener membresías
        const responseMem = await fetch(BASE_URL + `usuario-membresia`, {
            headers: {
                'Authorization': authToken
            }
        });

        // Obtener tipos de membresías para obtener los precios
        const responseTipos = await fetch(BASE_URL + `membresia-tipo`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (responseMem.ok && responseTipos.ok) {
            const todasMembresias = await responseMem.json();
            const tiposMembresia = await responseTipos.json();

            console.log('Total de membresías obtenidas:', todasMembresias.length);
            console.log('Todas las membresías:', todasMembresias);
            console.log('Tipos de membresía disponibles:', tiposMembresia);

            // Filtrar solo membresías activas
            const membresiasActivas = todasMembresias.filter(m => m.activa === true);
            console.log('Membresías activas:', membresiasActivas.length);
            console.log('Detalle membresías activas:', membresiasActivas);

            // Filtrar por periodo
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - parseInt(periodo));
            console.log('Fecha límite para filtro:', fechaLimite);

            const membresiasFiltradas = membresiasActivas.filter(m => {
                // Convertir array de fecha [año, mes, día, hora, minuto, segundo] a Date
                let fechaMembresia;
                if (Array.isArray(m.fecha_inicio)) {
                    // Restar 1 al mes porque JavaScript usa 0-11 para meses
                    fechaMembresia = new Date(
                        m.fecha_inicio[0], // año
                        m.fecha_inicio[1] - 1, // mes (0-11)
                        m.fecha_inicio[2], // día
                        m.fecha_inicio[3] || 0, // hora
                        m.fecha_inicio[4] || 0, // minuto
                        m.fecha_inicio[5] || 0  // segundo
                    );
                } else {
                    fechaMembresia = new Date(m.fecha_inicio);
                }
                console.log(`Comparando fecha ${m.fecha_inicio} (${fechaMembresia}) con límite ${fechaLimite}`);
                return fechaMembresia >= fechaLimite;
            });

            console.log('Membresías filtradas por periodo:', membresiasFiltradas.length);
            console.log('Detalle membresías filtradas:', membresiasFiltradas);

            // Contar por tipo de membresía (solo hay tipo 1 y 2)
            const tipo1 = membresiasFiltradas.filter(m => m.id_membresia_tipo === 1);
            const tipo2 = membresiasFiltradas.filter(m => m.id_membresia_tipo === 2);

            // Obtener nombre y precio de cada tipo
            const tipoMembresia1 = tiposMembresia.find(t => t.id_membresia_tipo === 1);
            const tipoMembresia2 = tiposMembresia.find(t => t.id_membresia_tipo === 2);

            console.log(`Tipo 1 (${tipoMembresia1?.nombre || 'N/A'}): ${tipo1.length} membresías`);
            console.log(`Tipo 2 (${tipoMembresia2?.nombre || 'N/A'}): ${tipo2.length} membresías`);

            // Calcular monto total
            const montoTotal = membresiasFiltradas.reduce((sum, m) => {
                const tipo = tiposMembresia.find(t => t.id_membresia_tipo === m.id_membresia_tipo);
                const precio = tipo ? parseFloat(tipo.precio || 0) : 0;
                console.log(`Membresía tipo ${m.id_membresia_tipo} (${tipo?.nombre}), precio: ${precio}`);
                return sum + precio;
            }, 0);

            console.log('Monto total calculado:', montoTotal);

            const datos = {
                tipo1: {
                    cantidad: tipo1.length,
                    nombre: tipoMembresia1?.nombre || 'Membresía 1',
                    precio: tipoMembresia1?.precio || 0
                },
                tipo2: {
                    cantidad: tipo2.length,
                    nombre: tipoMembresia2?.nombre || 'Membresía 2',
                    precio: tipoMembresia2?.precio || 0
                },
                monto_total: montoTotal
            };

            actualizarEstadisticas(datos);
        } else {
            console.error('Error al cargar estadísticas:', responseMem.status, responseTipos.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    }
};

function actualizarEstadisticas(datos) {
    // Actualizar cantidades por tipo de membresía
    const cantidad1 = datos.tipo1?.cantidad || 0;
    const cantidad2 = datos.tipo2?.cantidad || 0;
    const nombre1 = datos.tipo1?.nombre || 'Membresía 1';
    const nombre2 = datos.tipo2?.nombre || 'Membresía 2';

    document.getElementById('cantidadTipo1').innerText = cantidad1;
    document.getElementById('cantidadTipo2').innerText = cantidad2;
    document.getElementById('nombreTipo1').innerText = nombre1;
    document.getElementById('nombreTipo2').innerText = nombre2;

    // Actualizar monto total
    const montoTotal = datos.monto_total || 0;
    document.getElementById('montoTotal').innerText = `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Actualizar gráfico circular
    actualizarGrafico(cantidad1, cantidad2, nombre1, nombre2);
}

function actualizarGrafico(cantidad1, cantidad2, nombre1, nombre2) {
    const ctx = document.getElementById('graficoMembresias').getContext('2d');

    // Destruir gráfico anterior si existe
    if (graficoMembresias) {
        graficoMembresias.destroy();
    }

    // Crear nuevo gráfico
    graficoMembresias = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [nombre1, nombre2],
            datasets: [{
                data: [cantidad1, cantidad2],
                backgroundColor: [
                    '#FFD700', // Color para tipo 1
                    '#C0C0C0'  // Color para tipo 2
                ],
                borderColor: [
                    '#FFA500',
                    '#A9A9A9'
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
    document.getElementById('cantidadTipo1').innerText = 'Error';
    document.getElementById('cantidadTipo2').innerText = 'Error';
    document.getElementById('montoTotal').innerText = 'Error';

    // Mostrar gráfico vacío
    actualizarGrafico(0, 0, 'Tipo 1', 'Tipo 2');
}
