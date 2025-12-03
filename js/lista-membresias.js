import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Endpoint para obtener todas las membresías
        const response = await fetch(BASE_URL + 'usuario-membresia/all', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const membresias = await response.json();
            renderTabla(membresias);
        } else {
            console.error('Error al cargar membresías:', response.status);
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar datos.</td></tr>';
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error de conexión.</td></tr>';
    }

    function renderTabla(membresias) {
        tablaBody.innerHTML = '';

        if (membresias.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay membresías registradas.</td></tr>';
            return;
        }

        membresias.forEach(m => {
            const row = document.createElement('tr');

            // Formatear fechas
            const fechaInicio = new Date(m.fecha_inicio).toLocaleDateString('es-ES');
            const fechaFin = new Date(m.fecha_fin).toLocaleDateString('es-ES');

            // Determinar estado
            const estado = m.estado || 'ACTIVA';
            const esActiva = estado === 'ACTIVA';
            const claseEstado = esActiva ? 'estado-activo' : 'estado-inactivo';
            const textoEstado = esActiva ? 'Activo' : 'Inactivo';

            // Datos del usuario y membresía
            const nombreUsuario = m.nombre_usuario || 'Usuario desconocido';
            const correoUsuario = m.correo_usuario || 'N/A';
            const tipoMembresia = m.tipo_membresia || 'Estándar';

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${tipoMembresia}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td>
                    <span class="${claseEstado}">${textoEstado}</span>
                </td>
                <td class="text-center">
                    ${esActiva 
                        ? `<button class="btn-inhabilitar" onclick="window.cambiarEstadoMembresia(${m.id_usuario_membresia}, 'inhabilitar')">
                            Inhabilitar
                           </button>` 
                        : `<button class="btn-habilitar" onclick="window.cambiarEstadoMembresia(${m.id_usuario_membresia}, 'habilitar')">
                            Habilitar
                           </button>`
                    }
                </td>
            `;
            tablaBody.appendChild(row);
        });
    }

    // Función para cambiar estado de membresía
    window.cambiarEstadoMembresia = async (idMembresia, accion) => {
        const nuevoEstado = accion === 'habilitar' ? 'ACTIVA' : 'INACTIVA';
        
        if (!confirm(`¿Estás seguro de que deseas ${accion} esta membresía?`)) {
            return;
        }

        try {
            const response = await fetch(BASE_URL + `usuario-membresia/${idMembresia}/estado`, {
                method: 'PATCH',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                alert(`Membresía ${accion === 'habilitar' ? 'habilitada' : 'inhabilitada'} correctamente.`);
                location.reload();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'No se pudo cambiar el estado.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    };
});
