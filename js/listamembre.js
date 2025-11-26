import { BASE_URL } from "./api_url.js";
document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.querySelector('tbody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(BASE_URL+'usuario-membresia', {
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
        tablaBody.innerHTML = ''; // Limpiar tabla

        if (membresias.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay membresías registradas.</td></tr>';
            return;
        }

        membresias.forEach(m => {
            const row = document.createElement('tr');

            // Calcular estado y fechas (si el backend no las devuelve formateadas)
            const fechaInicio = new Date(m.fecha_inicio).toLocaleDateString();
            const fechaFin = new Date(m.fecha_expiracion).toLocaleDateString();
            const estadoClass = m.activa ? 'estado-activo' : 'estado-inactivo';
            const estadoTexto = m.activa ? 'Activo' : 'Inactivo';
            const btnClass = m.activa ? 'btn-inhabilitar' : 'btn-habilitar';
            const btnTexto = m.activa ? 'Inhabilitar' : 'Habilitar';
            const btnAction = m.activa ? 'inhabilitar' : 'habilitar';

            // Nota: El endpoint /usuario-membresia debería devolver datos del usuario y tipo de membresía
            // Si solo devuelve IDs, necesitaríamos hacer fetchs adicionales o que el backend incluya los objetos.
            // Asumiremos que el backend devuelve nombres o que podemos mostrarlos.
            // Si no, mostraremos IDs por ahora o "Cargando..."

            const nombreUsuario = m.nombre_usuario || `Usuario ${m.id_usuario}`;
            const correoUsuario = m.correo_usuario || 'N/A';
            const nombreMembresia = m.nombre_membresia || `Tipo ${m.id_membresia_tipo}`;

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${nombreMembresia}</td>
                <td class="${estadoClass}">${estadoTexto}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td><button class="${btnClass}" onclick="cambiarEstado(${m.id_usuario_membresia}, '${btnAction}')">${btnTexto}</button></td>
            `;
            tablaBody.appendChild(row);
        });
    }

    window.cambiarEstado = async (id, accion) => {
        if (!confirm(`¿Estás seguro de que deseas ${accion} esta membresía?`)) return;

        try {
            // Asumiendo que DELETE inactiva/elimina
            // O si hay un endpoint específico para cambiar estado
            const method = accion === 'inhabilitar' ? 'DELETE' : 'PUT';
            // Nota: La API doc solo menciona DELETE para cancelar. Para habilitar no está claro.
            // Usaremos DELETE para inhabilitar (cancelar).

            if (accion === 'habilitar') {
                alert('Funcionalidad de habilitar no disponible en API actualmente.');
                return;
            }

            const response = await fetch(`${BASE_URL}usuario-membresia/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authToken
                }
            });

            if (response.ok) {
                alert('Membresía actualizada correctamente.');
                location.reload();
            } else {
                alert('Error al actualizar membresía.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    };
});
