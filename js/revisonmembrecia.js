document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:7000/usuario-membresia', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const membresias = await response.json();
            renderTabla(membresias);
        } else {
            console.error('Error al cargar membresías:', response.status);
            tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar datos.</td></tr>';
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Error de conexión.</td></tr>';
    }

    function renderTabla(membresias) {
        tablaBody.innerHTML = ''; // Limpiar tabla

        if (membresias.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay membresías para revisar.</td></tr>';
            return;
        }

        membresias.forEach(m => {
            const row = document.createElement('tr');

            const fechaInicio = new Date(m.fecha_inicio).toLocaleDateString();

            // Asumimos que podemos obtener nombres. Si no, mostrar IDs.
            const nombreUsuario = m.nombre_usuario || `Usuario ${m.id_usuario}`;
            const correoUsuario = m.correo_usuario || 'N/A';
            const nombreMembresia = m.nombre_membresia || `Tipo ${m.id_membresia_tipo}`;

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${nombreMembresia}</td>
                <td>${fechaInicio}</td>
                <td>
                    <button class="btn-aceptar" onclick="accionMembresia(${m.id_usuario_membresia}, 'aceptar')">Aceptar</button>
                    <button class="btn-declinar" onclick="accionMembresia(${m.id_usuario_membresia}, 'declinar')">Declinar</button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    }

    window.accionMembresia = async (id, accion) => {
        // Como no hay endpoint de "Aceptar" (ya nacen activas), esto podría ser solo visual o un PUT si hubiera estado "PENDIENTE".
        // "Declinar" sería DELETE.

        if (!confirm(`¿Estás seguro de que deseas ${accion} esta membresía?`)) return;

        if (accion === 'declinar') {
            try {
                const response = await fetch(`http://localhost:7000/usuario-membresia/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': authToken }
                });

                if (response.ok) {
                    alert('Membresía declinada/eliminada correctamente.');
                    location.reload();
                } else {
                    alert('Error al eliminar membresía.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión.');
            }
        } else {
            // Aceptar
            alert('La membresía ya está activa (Simulación de aceptación).');
        }
    };
});
