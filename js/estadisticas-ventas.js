import { BASE_URL } from "./api_url.js";

let periodoActual = 7;
let graficoVentasDiarias = null;
let graficoTopProductos = null;

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
        // Obtener productos para tener nombres y categorías
        const productosResponse = await fetch(BASE_URL + `producto`, {
            headers: {
                'Authorization': authToken
            }
        });

        const productosMap = {};
        if (productosResponse.ok) {
            const productos = await productosResponse.json();
            // Crear un mapa de productos por ID
            productos.forEach(p => {
                productosMap[p.id] = {
                    nombre: p.nombre || p.titulo || 'Producto sin nombre',
                    categoria: p.categoria?.nombre || p.categoria_nombre || 'Sin categoría',
                    precio: p.precio || 0
                };
            });
            console.log('Productos cargados:', Object.keys(productosMap).length);
        }

        const response = await fetch(BASE_URL + `venta`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            let todasVentas = await response.json();
            console.log('Ventas obtenidas:', todasVentas.length);
            console.log('Ejemplo de venta:', todasVentas[0]);

            // Enriquecer ventas con información de productos
            todasVentas = todasVentas.map(venta => {
                const productoId = venta.producto_id || venta.productoId || venta.producto?.id;
                const infoProducto = productosMap[productoId];

                return {
                    ...venta,
                    producto_nombre: infoProducto?.nombre || venta.producto_nombre || venta.nombre_producto || venta.producto?.nombre || `Producto #${productoId}`,
                    categoria_nombre: infoProducto?.categoria || venta.categoria || venta.categoria_nombre || venta.producto?.categoria || 'Sin categoría'
                };
            });

            console.log('Ejemplo de venta enriquecida:', todasVentas[0]);

            // Filtrar ventas por periodo
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            console.log('Fecha límite para filtro:', fechaLimite);

            const ventasFiltradas = todasVentas.filter(v => {
                let fechaVenta;

                // Convertir array de fecha [año, mes, día, hora, minuto, segundo] a Date
                if (Array.isArray(v.fecha_venta)) {
                    fechaVenta = new Date(
                        v.fecha_venta[0],
                        v.fecha_venta[1] - 1, // mes (0-11)
                        v.fecha_venta[2],
                        v.fecha_venta[3] || 0,
                        v.fecha_venta[4] || 0,
                        v.fecha_venta[5] || 0
                    );
                } else if (Array.isArray(v.fecha)) {
                    fechaVenta = new Date(
                        v.fecha[0],
                        v.fecha[1] - 1,
                        v.fecha[2],
                        v.fecha[3] || 0,
                        v.fecha[4] || 0,
                        v.fecha[5] || 0
                    );
                } else {
                    fechaVenta = new Date(v.fecha_venta || v.fecha);
                }

                return fechaVenta >= fechaLimite;
            });

            console.log('Ventas filtradas:', ventasFiltradas.length);

            // Calcular estadísticas
            const datos = {
                total_productos: ventasFiltradas.reduce((sum, v) => sum + (parseInt(v.cantidad_vendida || v.cantidad || 0)), 0),
                monto_total: ventasFiltradas.reduce((sum, v) => sum + (parseFloat(v.precio_total || v.monto_total || v.total || 0)), 0)
            };

            console.log('Estadísticas calculadas:', datos);
            actualizarMetricas(datos);

            // Generar gráficas
            generarGraficoVentasDiarias(ventasFiltradas, dias);
            generarGraficoTopProductos(ventasFiltradas);
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

// FUNCIÓN PARA GENERAR GRÁFICO DE VENTAS DIARIAS
function generarGraficoVentasDiarias(ventas, dias) {
    // Destruir gráfico anterior si existe
    if (graficoVentasDiarias) {
        graficoVentasDiarias.destroy();
    }

    // Agrupar ventas por día
    const ventasPorDia = {};
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    // Inicializar todos los días con 0
    for (let i = 0; i < dias; i++) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + i);
        const fechaStr = fecha.toISOString().split('T')[0];
        ventasPorDia[fechaStr] = 0;
    }

    // Sumar ventas por día
    ventas.forEach(venta => {
        let fechaVenta;
        if (Array.isArray(venta.fecha_venta)) {
            fechaVenta = new Date(venta.fecha_venta[0], venta.fecha_venta[1] - 1, venta.fecha_venta[2]);
        } else if (Array.isArray(venta.fecha)) {
            fechaVenta = new Date(venta.fecha[0], venta.fecha[1] - 1, venta.fecha[2]);
        } else {
            fechaVenta = new Date(venta.fecha_venta || venta.fecha);
        }

        const fechaStr = fechaVenta.toISOString().split('T')[0];
        if (ventasPorDia.hasOwnProperty(fechaStr)) {
            ventasPorDia[fechaStr] += parseFloat(venta.precio_total || venta.monto_total || venta.total || 0);
        }
    });

    // Preparar datos para el gráfico
    const labels = Object.keys(ventasPorDia).map(fecha => {
        const [, month, day] = fecha.split('-');
        return `${day}/${month}`;
    });
    const datos = Object.values(ventasPorDia);

    // Crear gráfico
    const ctx = document.getElementById('graficoVentasDiarias').getContext('2d');
    graficoVentasDiarias = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: datos,
                borderColor: '#fc4b08',
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
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fc4b08',
                    borderWidth: 1,
                    padding: 12,
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
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        },
                        color: '#666',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// FUNCIÓN PARA GENERAR GRÁFICO DE TOP PRODUCTOS
function generarGraficoTopProductos(ventas) {
    // Destruir gráfico anterior si existe
    if (graficoTopProductos) {
        graficoTopProductos.destroy();
    }

    // Obtener productos más vendidos
    const productosVendidos = calcularProductosMasVendidos(ventas);
    const top5 = productosVendidos.slice(0, 5);

    if (top5.length === 0) {
        // Si no hay datos, mostrar mensaje
        const ctx = document.getElementById('graficoTopProductos').getContext('2d');
        graficoTopProductos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    label: 'Cantidad',
                    data: [0],
                    backgroundColor: 'rgba(200, 200, 200, 0.5)'
                }]
            }
        });
        return;
    }

    const labels = top5.map(p => p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre);
    const datos = top5.map(p => p.cantidad);

    // Colores degradados para las barras
    const colores = [
        'rgba(252, 75, 8, 0.9)',
        'rgba(252, 100, 40, 0.8)',
        'rgba(252, 125, 70, 0.7)',
        'rgba(241, 168, 126, 0.6)',
        'rgba(254, 234, 207, 0.5)'
    ];

    // Crear gráfico
    const ctx = document.getElementById('graficoTopProductos').getContext('2d');
    graficoTopProductos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad Vendida',
                data: datos,
                backgroundColor: colores,
                borderColor: colores.map(c => c.replace('0.', '1.')),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fc4b08',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const producto = top5[context.dataIndex];
                            return [
                                'Cantidad: ' + producto.cantidad,
                                'Ingresos: $' + producto.ingresos.toFixed(2)
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#666',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// FUNCIÓN PARA CALCULAR PRODUCTOS MÁS VENDIDOS
function calcularProductosMasVendidos(ventas) {
    const productosMap = {};

    ventas.forEach(venta => {
        // Obtener ID del producto desde múltiples posibles fuentes
        const productoId = venta.producto_id || venta.productoId || venta.producto?.id || 'Desconocido';

        // Usar los campos enriquecidos que ya vienen desde la API
        const productoNombre = venta.producto_nombre || venta.nombre_producto || venta.producto?.nombre || venta.nombre || `Producto #${productoId}`;
        const categoria = venta.categoria_nombre || venta.categoria || venta.producto?.categoria || 'Sin categoría';

        // Obtener cantidad y precio
        const cantidad = parseInt(venta.cantidad_vendida || venta.cantidad || 1);
        const precio = parseFloat(venta.precio_total || venta.monto_total || venta.total || 0);

        // Agrupar por ID de producto
        if (!productosMap[productoId]) {
            productosMap[productoId] = {
                id: productoId,
                nombre: productoNombre,
                categoria: categoria,
                cantidad: 0,
                ingresos: 0
            };
        }

        productosMap[productoId].cantidad += cantidad;
        productosMap[productoId].ingresos += precio;
    });

    // Convertir a array y ordenar por cantidad vendida
    const productosArray = Object.values(productosMap);
    productosArray.sort((a, b) => b.cantidad - a.cantidad);

    console.log('Top 5 productos calculados:', productosArray.slice(0, 5));
    return productosArray;
}

// FUNCIÓN PARA GENERAR TABLA DE PRODUCTOS
function generarTablaProductos(ventas) {
    const tbody = document.getElementById('tablaProductosBody');
    const productos = calcularProductosMasVendidos(ventas);

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay datos de ventas para mostrar</td></tr>';
        return;
    }

    // Tomar top 10
    const top10 = productos.slice(0, 10);

    let html = '';
    top10.forEach((producto, index) => {
        const precioPromedio = producto.ingresos / producto.cantidad;
        const badge = index === 0 ? '<span class="badge-top">🏆 #1</span>' : '';

        html += `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${badge} ${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td><strong>${producto.cantidad}</strong></td>
                <td style="color: #fc4b08; font-weight: bold;">$${producto.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${precioPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}
