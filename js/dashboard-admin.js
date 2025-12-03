import { BASE_URL } from "./api_url.js";

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
        const [usuarios, ventas, membresias] = await Promise.all([
            fetch(BASE_URL + 'usuario', { headers: { 'Authorization': authToken } }).then(r => r.json()),
            fetch(BASE_URL + 'venta', { headers: { 'Authorization': authToken } }).then(r => r.json()),
            fetch(BASE_URL + 'usuario-membresia', { headers: { 'Authorization': authToken } }).then(r => r.json())
        ]);

        // Actualizar métricas
        document.getElementById('totalUsuarios').innerText = usuarios.length || 0;

        // Calcular el monto total de ventas del mes actual
        let montoVentasMes = 0;
        if (Array.isArray(ventas)) {
            const fechaActual = new Date();
            const mesActual = fechaActual.getMonth();
            const anioActual = fechaActual.getFullYear();

            const ventasMes = ventas.filter(venta => {
                let fechaVenta;

                // Convertir array de fecha [año, mes, día] a Date
                if (Array.isArray(venta.fecha_venta)) {
                    fechaVenta = new Date(venta.fecha_venta[0], venta.fecha_venta[1] - 1, venta.fecha_venta[2]);
                } else if (Array.isArray(venta.fecha)) {
                    fechaVenta = new Date(venta.fecha[0], venta.fecha[1] - 1, venta.fecha[2]);
                } else {
                    fechaVenta = new Date(venta.fecha_venta || venta.fecha);
                }

                return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual;
            });

            montoVentasMes = ventasMes.reduce((sum, venta) => {
                const monto = venta.precio_total || venta.monto_total || venta.total || 0;
                return sum + parseFloat(monto);
            }, 0);
        }
        document.getElementById('ventasMes').innerText = `$${montoVentasMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

        // Filtrar membresías activas usando el campo correcto
        const membresiasActivas = Array.isArray(membresias) ? membresias.filter(m => m.activa === true) : [];
        document.getElementById('totalMembresias').innerText = membresiasActivas.length || 0;

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}
