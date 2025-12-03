import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!authToken || !userId) {
        window.location.href = '../pages/login.html';
        return;
    }

    await cargarInformacionUsuario(userId, authToken);
});

async function cargarInformacionUsuario(userId, authToken) {
    try {
        const response = await fetch(BASE_URL + `usuarios/${userId}`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (response.ok) {
            const usuario = await response.json();
            renderizarInformacion(usuario);
        } else {
            console.error('Error al cargar información del usuario:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    }
}

function renderizarInformacion(usuario) {
    // Nombre
    document.getElementById('nombreUsuario').innerText = usuario.nombre || 'Usuario';

    // Rol
    document.getElementById('rolUsuario').innerText = usuario.rol === 'admin' ? 'Administrador' : usuario.rol || 'Usuario';

    // ID
    document.getElementById('idUsuario').innerText = `#${usuario.id_usuario || '000000'}`;

    // Correo
    document.getElementById('correoUsuario').innerText = usuario.correo || 'No disponible';

    // Teléfono
    document.getElementById('telefonoUsuario').innerText = usuario.telefono || 'No registrado';

    // Fecha de registro
    if (usuario.fecha_registro) {
        const fecha = new Date(usuario.fecha_registro);
        document.getElementById('fechaRegistro').innerText = fecha.toLocaleDateString('es-ES');
    } else {
        document.getElementById('fechaRegistro').innerText = 'No disponible';
    }

    // Membresía
    const membresiaElement = document.getElementById('membresia');
    if (usuario.membresia && usuario.membresia !== 'ninguna') {
        const tipo = usuario.membresia.charAt(0).toUpperCase() + usuario.membresia.slice(1);
        membresiaElement.innerHTML = `<span class="badge-membresia badge-${usuario.membresia}">${tipo}</span>`;
    } else {
        membresiaElement.innerHTML = '<span class="badge-membresia">Sin membresía</span>';
    }

    // Estado
    const estadoElement = document.getElementById('estadoUsuario');
    if (usuario.estado === 'activo' || usuario.estado === 'ACTIVO' || usuario.activo === true) {
        estadoElement.innerHTML = '<span class="estado-activo">Activo</span>';
    } else {
        estadoElement.innerHTML = '<span class="estado-inactivo">Inactivo</span>';
    }

    // Avatar (si existe)
    if (usuario.avatar) {
        document.getElementById('avatarUsuario').src = usuario.avatar;
    }
}

function mostrarError() {
    document.getElementById('nombreUsuario').innerText = 'Error al cargar';
    document.getElementById('rolUsuario').innerText = 'Error';
    document.getElementById('idUsuario').innerText = '#ERROR';
    document.getElementById('correoUsuario').innerText = 'Error al cargar datos';
    document.getElementById('telefonoUsuario').innerText = 'Error';
    document.getElementById('fechaRegistro').innerText = 'Error';
}

window.cerrarSesion = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('rol');
        window.location.href = '../login.html';
    }
};
