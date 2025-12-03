import { BASE_URL } from "./api_url.js";

let usuarios = [];
let usuariosFiltrados = [];
let roles = [];
let paginaActual = 1;
const usuariosPorPagina = 10;

let perfilUsuarioActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    // Obtener el perfil del usuario actual para tener su ID
    const userId = localStorage.getItem('userId');

    try {
        let perfilResponse = await fetch(BASE_URL + 'usuario/profile', {
            headers: { 'Authorization': authToken }
        });

        // Si el endpoint /profile no existe, intentar con el ID si está disponible
        if (!perfilResponse.ok && userId) {
            console.log('Endpoint /profile no disponible, obteniendo usuario por ID:', userId);
            perfilResponse = await fetch(BASE_URL + `usuario/${userId}`, {
                headers: { 'Authorization': authToken }
            });
        }

        if (perfilResponse.ok) {
            perfilUsuarioActual = await perfilResponse.json();
            console.log('Perfil de administrador cargado:', perfilUsuarioActual);

            // Guardar el ID en localStorage si no existe
            if (!userId && perfilUsuarioActual.id_usuario) {
                localStorage.setItem('userId', perfilUsuarioActual.id_usuario);
            }
        } else {
            console.warn('No se pudo cargar el perfil del usuario. Funciones de administración pueden fallar.');
        }
    } catch (error) {
        console.error('Error al obtener perfil:', error);
    }

    await cargarRoles();
    await cargarUsuarios();
});

async function cargarRoles() {
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(BASE_URL + 'rol', {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            roles = await response.json();
            console.log('Roles cargados:', roles);
        } else {
            console.error('Error al cargar roles:', response.status);
        }
    } catch (error) {
        console.error('Error de red al cargar roles:', error);
    }
}

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

            // Log para debug: mostrar usuarios con sus roles
            console.log('Usuarios cargados:', usuarios.length);
            usuarios.forEach(u => {
                const rol = roles.find(r => r.id_rol === u.id_rol);
                console.log(`Usuario: ${u.nombre_usuario}, id_rol: ${u.id_rol}, Rol: ${rol ? rol.descripcion : 'Sin rol'}`);
            });

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

        const nombre = u.nombre_usuario || u.nombre || 'Sin nombre';
        const correo = u.correo_usuario || u.correo || 'Sin correo';

        // Buscar el nombre del rol por ID
        const rolEncontrado = roles.find(r => r.id_rol === u.id_rol);
        const nombreRol = rolEncontrado ? rolEncontrado.descripcion : 'Sin rol';

        const activo = u.activo !== undefined ? u.activo : true;
        const estadoClass = activo ? 'estado-activo' : 'estado-inactivo';
        const estadoTexto = activo ? 'Activo' : 'Inactivo';

        row.innerHTML = `
            <td>#${u.id_usuario || u.id}</td>
            <td>${nombre}</td>
            <td>${correo}</td>
            <td><span class="badge-rol badge-${nombreRol.toLowerCase()}">${nombreRol}</span></td>
            <td class="text-center"><span class="${estadoClass}">${estadoTexto}</span></td>
            <td class="text-center">
                <button class="btn-ver" onclick="window.verDetalleUsuario(${u.id_usuario || u.id})">
                    <i class="fa-solid fa-eye"></i> Ver
                </button>
                ${activo ?
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

window.filtrarUsuarios = (filtro, botonElement) => {
    paginaActual = 1;

    // Actualizar botones activos
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    if (botonElement) {
        botonElement.classList.add('active');
    }

    // Aplicar filtro
    if (filtro === 'todos') {
        usuariosFiltrados = usuarios;
    } else if (filtro === 'activo') {
        usuariosFiltrados = usuarios.filter(u => u.activo === true);
    } else if (filtro === 'inactivo') {
        usuariosFiltrados = usuarios.filter(u => u.activo === false);
    } else {
        // Filtrar por descripción de rol (buscar el ID del rol por descripción)
        const rolBuscado = roles.find(r => r.descripcion && r.descripcion.toLowerCase() === filtro.toLowerCase());
        console.log(`Filtro: "${filtro}"`);
        console.log('Rol buscado:', rolBuscado);

        if (rolBuscado) {
            usuariosFiltrados = usuarios.filter(u => u.id_rol === rolBuscado.id_rol);
            console.log(`Usuarios encontrados con rol ${rolBuscado.descripcion}:`, usuariosFiltrados.length);
        } else {
            console.log('No se encontró el rol');
            usuariosFiltrados = [];
        }
    }

    renderizarTabla();
};

window.buscarUsuario = () => {
    const termino = document.getElementById('inputBuscar').value.toLowerCase().trim();

    if (!termino) {
        usuariosFiltrados = usuarios;
    } else {
        usuariosFiltrados = usuarios.filter(u =>
            (u.nombre_usuario || u.nombre || '').toLowerCase().includes(termino) ||
            (u.correo_usuario || u.correo || '').toLowerCase().includes(termino) ||
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
            document.getElementById('detalleNombre').innerText = usuario.nombre_usuario || usuario.nombre || 'N/A';
            document.getElementById('detalleCorreo').innerText = usuario.correo_usuario || usuario.correo || 'N/A';
            document.getElementById('detalleTelefono').innerText = usuario.telefono || 'N/A';

            // Buscar el nombre del rol por ID
            const rolEncontrado = roles.find(r => r.id_rol === usuario.id_rol);
            const nombreRol = rolEncontrado ? rolEncontrado.descripcion : 'Sin rol';
            document.getElementById('detalleRol').innerText = nombreRol;

            const activo = usuario.activo !== undefined ? usuario.activo : true;
            const estadoHtml = activo
                ? '<span class="estado-activo">Activo</span>'
                : '<span class="estado-inactivo">Inactivo</span>';
            document.getElementById('detalleEstado').innerHTML = estadoHtml;

            // Convertir fecha array a formato legible
            let fechaRegistro = 'N/A';
            if (Array.isArray(usuario.fecha_registro)) {
                const fechaObj = new Date(
                    usuario.fecha_registro[0],
                    usuario.fecha_registro[1] - 1,
                    usuario.fecha_registro[2],
                    usuario.fecha_registro[3] || 0,
                    usuario.fecha_registro[4] || 0,
                    usuario.fecha_registro[5] || 0
                );
                fechaRegistro = fechaObj.toLocaleDateString('es-ES');
            } else if (usuario.fecha_registro) {
                fechaRegistro = new Date(usuario.fecha_registro).toLocaleDateString('es-ES');
            }
            document.getElementById('detalleFechaRegistro').innerText = fechaRegistro;

            // Buscar membresía del usuario
            try {
                const membresiaResponse = await fetch(BASE_URL + 'usuario-membresia', {
                    headers: { 'Authorization': authToken }
                });

                if (membresiaResponse.ok) {
                    const membresias = await membresiaResponse.json();
                    const membresiaUsuario = membresias.find(m => m.id_usuario === idUsuario && m.activa === true);

                    if (membresiaUsuario) {
                        // Obtener nombre de membresía
                        const tiposResponse = await fetch(BASE_URL + 'membresia-tipo', {
                            headers: { 'Authorization': authToken }
                        });

                        if (tiposResponse.ok) {
                            const tipos = await tiposResponse.json();
                            const tipo = tipos.find(t => t.id_membresia_tipo === membresiaUsuario.id_membresia_tipo);
                            document.getElementById('detalleMembresia').innerText = tipo ? tipo.nombre : 'Membresía activa';
                        } else {
                            document.getElementById('detalleMembresia').innerText = 'Membresía activa';
                        }
                    } else {
                        document.getElementById('detalleMembresia').innerText = 'Sin membresía';
                    }
                } else {
                    document.getElementById('detalleMembresia').innerText = 'Sin membresía';
                }
            } catch (error) {
                console.error('Error al cargar membresía:', error);
                document.getElementById('detalleMembresia').innerText = 'Error al cargar';
            }

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
    const nuevoActivo = accion === 'activar';

    if (!confirm(`¿Estás seguro de que deseas ${accion} este usuario?`)) {
        return;
    }

    try {
        console.log('Cambiando estado del usuario:', idUsuario, 'a', nuevoActivo);

        const response = await fetch(BASE_URL + `usuario/${idUsuario}`, {
            method: 'PATCH',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo: nuevoActivo })
        });

        if (response.ok) {
            alert(`Usuario ${accion === 'suspender' ? 'suspendido' : 'activado'} correctamente.`);
            await cargarUsuarios();
        } else {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            alert(`Error: No se pudo cambiar el estado del usuario. ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};

function mostrarError() {
    const tablaBody = document.getElementById('tablaBody');
    tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar usuarios.</td></tr>';
}
