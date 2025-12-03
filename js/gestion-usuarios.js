import { BASE_URL } from "./api_url.js";

let usuarios = [];
let usuariosFiltrados = [];
let filtroActual = 'todos';
let paginaActual = 1;
const usuariosPorPagina = 10;

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    await cargarUsuarios();
});

async function cargarUsuarios() {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + 'usuario', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            usuarios = await response.json();
            usuariosFiltrados = usuarios;
            renderizarTabla();
        } else {
            console.error('Error al cargar usuarios:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    }
}

function renderizarTabla() {
    const tablaBody = document.getElementById('tablaBody');
    tablaBody.innerHTML = '';

    if (usuariosFiltrados.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios que coincidan con el filtro.</td></tr>';
        return;
    }

    // Paginación
    const inicio = (paginaActual - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

    usuariosPagina.forEach(u => {
        const row = document.createElement('tr');

        const nombre = u.nombre || u.nombre_completo || 'Sin nombre';
        const correo = u.correo || u.email || 'Sin correo';
        const rol = u.rol || 'usuario';
        const estado = u.estado || u.activo ? 'activo' : 'inactivo';
        const fechaRegistro = u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-ES') : 'N/A';

        const estadoClass = estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
        const estadoTexto = estado === 'activo' ? 'Activo' : 'Inactivo';

        row.innerHTML = `
            <td>#${u.id_usuario || u.id}</td>
            <td>${nombre}</td>
            <td>${correo}</td>
            <td><span class="badge-rol badge-${rol}">${rol.charAt(0).toUpperCase() + rol.slice(1)}</span></td>
            <td class="text-center"><span class="${estadoClass}">${estadoTexto}</span></td>
            <td>${fechaRegistro}</td>
            <td class="text-center">
                <button class="btn-ver" onclick="window.verDetalleUsuario(${u.id_usuario || u.id})">
                    <i class="fa-solid fa-eye"></i> Ver
                </button>
                ${estado === 'activo' ? 
                    `<button class="btn-suspender" onclick="window.cambiarEstadoUsuario(${u.id_usuario || u.id}, 'suspender')">
                        Suspender
                    </button>` : 
                    `<button class="btn-activar" onclick="window.cambiarEstadoUsuario(${u.id_usuario || u.id}, 'activar')">
                        Activar
                    </button>`
                }
            </td>
        `;
        tablaBody.appendChild(row);
    });

    // Actualizar paginación
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    document.getElementById('paginaActual').innerText = `Página ${paginaActual} de ${totalPaginas}`;
}

window.filtrarUsuarios = (filtro) => {
    filtroActual = filtro;
    paginaActual = 1;

    // Actualizar botones activos
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Aplicar filtro
    if (filtro === 'todos') {
        usuariosFiltrados = usuarios;
    } else if (filtro === 'activo' || filtro === 'inactivo') {
        usuariosFiltrados = usuarios.filter(u => {
            const estado = u.estado || (u.activo ? 'activo' : 'inactivo');
            return estado === filtro;
        });
    } else {
        usuariosFiltrados = usuarios.filter(u => u.rol === filtro);
    }

    renderizarTabla();
};

window.buscarUsuario = () => {
    const termino = document.getElementById('inputBuscar').value.toLowerCase().trim();
    
    if (!termino) {
        usuariosFiltrados = usuarios;
    } else {
        usuariosFiltrados = usuarios.filter(u => 
            (u.nombre || '').toLowerCase().includes(termino) ||
            (u.correo || '').toLowerCase().includes(termino) ||
            (u.id_usuario || '').toString().includes(termino)
        );
    }

    paginaActual = 1;
    renderizarTabla();
};

window.cambiarPagina = (direccion) => {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    
    paginaActual += direccion;
    
    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    
    renderizarTabla();
};

window.verDetalleUsuario = async (idUsuario) => {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + `usuario/${idUsuario}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const usuario = await response.json();
            
            document.getElementById('detalleId').innerText = `#${usuario.id_usuario || usuario.id}`;
            document.getElementById('detalleNombre').innerText = usuario.nombre || usuario.nombre_completo || 'N/A';
            document.getElementById('detalleCorreo').innerText = usuario.correo || usuario.email || 'N/A';
            document.getElementById('detalleTelefono').innerText = usuario.telefono || 'N/A';
            document.getElementById('detalleRol').innerText = (usuario.rol || 'usuario').charAt(0).toUpperCase() + (usuario.rol || 'usuario').slice(1);
            
            const estado = usuario.estado || (usuario.activo ? 'activo' : 'inactivo');
            const estadoHtml = estado === 'activo' 
                ? '<span class="estado-activo">Activo</span>' 
                : '<span class="estado-inactivo">Inactivo</span>';
            document.getElementById('detalleEstado').innerHTML = estadoHtml;
            
            const fechaRegistro = usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString('es-ES') : 'N/A';
            document.getElementById('detalleFechaRegistro').innerText = fechaRegistro;
            
            document.getElementById('detalleMembresia').innerText = usuario.membresia || 'Sin membresía';

            const modal = new bootstrap.Modal(document.getElementById('modalDetalleUsuario'));
            modal.show();
        } else {
            alert('Error al cargar detalle del usuario.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

window.cambiarEstadoUsuario = async (idUsuario, accion) => {
    const authToken = localStorage.getItem('authToken');
    const nuevoEstado = accion === 'suspender' ? 'inactivo' : 'activo';

    if (!confirm(`¿Estás seguro de que deseas ${accion} este usuario?`)) {
        return;
    }

    try {
        // Primero obtener los datos actuales del usuario
        const getResponse = await fetch(BASE_URL + `usuario/${idUsuario}`, {
            headers: { 'Authorization': authToken }
        });
        
        if (!getResponse.ok) {
            throw new Error('No se pudo obtener los datos del usuario');
        }
        
        const userData = await getResponse.json();
        
        // Actualizar el usuario con el nuevo estado
        const response = await fetch(BASE_URL + `usuario/${idUsuario}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...userData, estado: nuevoEstado })
        });

        if (response.ok) {
            alert(`Usuario ${accion === 'suspender' ? 'suspendido' : 'activado'} correctamente.`);
            await cargarUsuarios();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'No se pudo cambiar el estado.'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

function mostrarError() {
    const tablaBody = document.getElementById('tablaBody');
    tablaBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar usuarios.</td></tr>';
}
