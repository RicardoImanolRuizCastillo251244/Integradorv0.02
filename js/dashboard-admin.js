import { BASE_URL } from "./api_url.js";

let graficoCategoriasInstance = null;
let graficoVentasInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    await cargarDashboard();
});

async function cargarDashboard() {
    const authToken = localStorage.getItem('authToken');

    try {
        // Cargar métricas principales en paralelo
        const [usuarios, productos, ventas, membresias] = await Promise.all([
            fetch(BASE_URL + 'usuario', { headers: { 'Authorization': authToken } }).then(r => r.json()),
            fetch(BASE_URL + 'publicacion', { headers: { 'Authorization': authToken } }).then(r => r.json()),
            fetch(BASE_URL + 'venta', { headers: { 'Authorization': authToken } }).then(r => r.json()),
            fetch(BASE_URL + 'usuario-membresia/all', { headers: { 'Authorization': authToken } }).then(r => r.json())
        ]);

        // Actualizar métricas
        document.getElementById('totalUsuarios').innerText = usuarios.length || 0;
        
        const productosActivos = productos.filter(p => p.estado === 'activo' || p.activo);
        document.getElementById('totalProductos').innerText = productosActivos.length || 0;
        
        const montoVentas = ventas.monto_total || ventas.montoTotal || 0;
        document.getElementById('ventasMes').innerText = `$${montoVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
        
        const membresiasActivas = membresias.filter(m => m.estado === 'activo' || m.activo);
        document.getElementById('totalMembresias').innerText = membresiasActivas.length || 0;

        // Cargar badges de acciones rápidas
        await cargarBadges();

        // Cargar actividad reciente
        await cargarActividad();

        // Cargar gráficas
        await cargarGraficoCategorias(productos);
        await cargarGraficoVentas();

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

async function cargarBadges() {
    const authToken = localStorage.getItem('authToken');

    try {
        // Productos en cuarentena
        const cuarentena = await fetch(BASE_URL + 'publicacion', {
            headers: { 'Authorization': authToken }
        }).then(r => r.json()).then(pubs => pubs.filter(p => p.estado_publicacion === 'cuarentena'));
        document.getElementById('badgeCuarentena').innerText = cuarentena.length || 0;

        // Membresías pendientes
        const membresiasPendientes = await fetch(BASE_URL + 'usuario-membresia', {
            headers: { 'Authorization': authToken }
        }).then(r => r.json());
        document.getElementById('badgeMembresias').innerText = membresiasPendientes.length || 0;

        // Quejas pendientes
        const quejas = await fetch(BASE_URL + 'quejas', {
            headers: { 'Authorization': authToken }
        }).then(r => r.json());
        const quejasPendientes = quejas.filter(q => q.estado === 'pendiente' || !q.estado);
        document.getElementById('badgeQuejas').innerText = quejasPendientes.length || 0;

        // Productos pendientes
        const productos = await fetch(BASE_URL + 'publicacion', {
            headers: { 'Authorization': authToken }
        }).then(r => r.json());
        const productosPendientes = productos.filter(p => p.estado === 'pendiente');
        document.getElementById('badgeProductos').innerText = productosPendientes.length || 0;

    } catch (error) {
        console.error('Error al cargar badges:', error);
    }
}

async function cargarActividad() {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(BASE_URL + `notificaciones/usuario/${userId}?limite=10`, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const notificaciones = await response.json();
            renderizarActividad(notificaciones);
        } else {
            document.getElementById('actividadReciente').innerHTML = '<div class="actividad-item"><p class="text-center text-muted">No hay actividad reciente.</p></div>';
        }
    } catch (error) {
        console.error('Error al cargar actividad:', error);
        document.getElementById('actividadReciente').innerHTML = '<div class="actividad-item"><p class="text-center text-muted">Error al cargar actividad.</p></div>';
    }
}

function renderizarActividad(notificaciones) {
    const container = document.getElementById('actividadReciente');
    container.innerHTML = '';

    if (notificaciones.length === 0) {
        container.innerHTML = '<div class="actividad-item"><p class="text-center text-muted">No hay actividad reciente.</p></div>';
        return;
    }

    notificaciones.slice(0, 5).forEach(n => {
        const fecha = new Date(n.fecha_creacion || n.fecha);
        const fechaFormato = fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        let icono = 'fa-bell';
        let color = '#fc4b08';
        
        if (n.tipo === 'queja') {
            icono = 'fa-exclamation-triangle';
            color = '#c00000';
        } else if (n.tipo === 'membresia') {
            icono = 'fa-crown';
            color = '#FFD700';
        } else if (n.tipo === 'producto') {
            icono = 'fa-box';
            color = '#4d9d30';
        }

        const item = document.createElement('div');
        item.className = 'actividad-item';
        item.innerHTML = `
            <div class="actividad-icono" style="background: ${color};">
                <i class="fa-solid ${icono}"></i>
            </div>
            <div class="actividad-detalle">
                <p class="actividad-texto">${n.titulo || n.mensaje || 'Actividad sin título'}</p>
                <p class="actividad-fecha">${fechaFormato}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

async function cargarGraficoCategorias(productos) {
    const categorias = {};
    
    productos.forEach(p => {
        const cat = p.categoria || p.tipo_producto || 'Sin categoría';
        categorias[cat] = (categorias[cat] || 0) + 1;
    });

    const labels = Object.keys(categorias);
    const data = Object.values(categorias);

    const colores = [
        '#fc4b08', '#c00000', '#4d9d30', '#FFD700', '#051bb2',
        '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#795548'
    ];

    const ctx = document.getElementById('graficoCategorias');
    
    if (graficoCategoriasInstance) {
        graficoCategoriasInstance.destroy();
    }

    graficoCategoriasInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colores.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentaje = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${porcentaje}%)`;
                        }
                    }
                }
            }
        }
    });
}

async function cargarGraficoVentas() {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + 'estadisticas/ventas-diarias?dias=7', {
            headers: { 'Authorization': authToken }
        });

        let labels = [];
        let data = [];

        if (response.ok) {
            const ventas = await response.json();
            labels = ventas.map(v => {
                const fecha = new Date(v.fecha);
                return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            });
            data = ventas.map(v => v.monto || v.total || 0);
        } else {
            // Datos de ejemplo si el endpoint no existe
            const hoy = new Date();
            for (let i = 6; i >= 0; i--) {
                const fecha = new Date(hoy);
                fecha.setDate(fecha.getDate() - i);
                labels.push(fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
                data.push(Math.floor(Math.random() * 10000) + 5000);
            }
        }

        const ctx = document.getElementById('graficoVentas');
        
        if (graficoVentasInstance) {
            graficoVentasInstance.destroy();
        }

        graficoVentasInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: data,
                    borderColor: '#fc4b08',
                    backgroundColor: 'rgba(252, 75, 8, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#fc4b08',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ventas: $${context.parsed.y.toLocaleString('es-MX')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-MX');
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar gráfico de ventas:', error);
    }
}
