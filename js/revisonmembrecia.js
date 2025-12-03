import { BASE_URL } from "./api_url.js";

document.addEventListener('DOMContentLoaded', async () => {
    const tablaBody = document.getElementById('tablaBody');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        // Obtener todas las membresías
        const responseMem = await fetch(BASE_URL + 'usuario-membresia', {
            headers: {
                'Authorization': authToken
            }
        });

        // Obtener todos los usuarios
        const responseUsers = await fetch(BASE_URL + 'usuario', {
            headers: {
                'Authorization': authToken
            }
        });

        if (responseMem.ok && responseUsers.ok) {
            const membresias = await responseMem.json();
            const usuarios = await responseUsers.json();
            renderTabla(membresias, usuarios);
        } else {
            console.error('Error al cargar datos:', responseMem.status, responseUsers.status);
            tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Error al cargar datos.</td></tr>';
        }
    } catch (error) {
        console.error('Error de red:', error);
        tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Error de conexión.</td></tr>';
    }

    function renderTabla(membresias, usuarios) {
        tablaBody.innerHTML = '';

        // Filtrar solo las membresías INACTIVAS (pendientes de revisión)
        const membresiasPendientes = membresias.filter(m => m.activa === false);

        console.log('Total de membresías:', membresias.length);
        console.log('Membresías pendientes:', membresiasPendientes.length);

        if (membresiasPendientes.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay membresías pendientes para revisar.</td></tr>';
            return;
        }

        membresiasPendientes.forEach(m => {
            const row = document.createElement('tr');

            // Buscar el usuario por ID
            const usuarioEncontrado = usuarios.find(u => u.id_usuario === m.id_usuario);
            const nombreUsuario = usuarioEncontrado ? usuarioEncontrado.nombre_usuario : `Usuario ${m.id_usuario}`;
            const correoUsuario = usuarioEncontrado ? usuarioEncontrado.correo_usuario : 'N/A';

            const nombreMembresia = m.nombre_membresia || m.tipo_membresia || `Tipo ${m.id_membresia_tipo}`;
            const captura = m.captura_transferencia || m.comprobante || null;

            row.innerHTML = `
                <td>${nombreUsuario}</td>
                <td>${correoUsuario}</td>
                <td>${nombreMembresia}</td>
                <td class="text-center">
                    ${captura
                        ? `<button class="btn-ver-captura" onclick="window.verCaptura('${captura}')">
                             <i class="fa-solid fa-image"></i> Ver captura
                           </button>`
                        : '<span class="text-muted">Sin captura</span>'}
                </td>
                <td class="text-center">
                    <button class="btn-aceptar" onclick="window.accionMembresia(${m.id_usuario_membresia}, 'aceptar')">
                        Aceptar
                    </button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    }
});

// Función para ver captura en modal
window.verCaptura = (urlCaptura) => {
    const imagenAmpliada = document.getElementById('imagenAmpliada');
    imagenAmpliada.src = urlCaptura;
    
    const modal = new bootstrap.Modal(document.getElementById('modalImagen'));
    modal.show();
};

// Función para aceptar o inhabilitar membresía
window.accionMembresia = async (id, accion) => {
    const authToken = localStorage.getItem('authToken');

    const mensajeAccion = accion === 'aceptar' ? 'aceptar' : 'inhabilitar';
    if (!confirm(`¿Estás seguro de que deseas ${mensajeAccion} esta membresía?`)) {
        return;
    }

    try {
        // Obtener primero los datos de la membresía
        const getResponse = await fetch(`${BASE_URL}usuario-membresia`, {
            headers: {
                'Authorization': authToken
            }
        });

        if (!getResponse.ok) {
            alert('Error al obtener los datos de la membresía.');
            return;
        }

        const membresias = await getResponse.json();
        const membresia = membresias.find(m => m.id_usuario_membresia === id);

        if (!membresia) {
            alert('No se encontró la membresía.');
            return;
        }

        // Construir el objeto limpio con SOLO los campos que acepta el backend
        const membresiaLimpia = {
            id_usuario: membresia.id_usuario,
            id_membresia_tipo: membresia.id_membresia_tipo,
            fecha_inicio: membresia.fecha_inicio,
            fecha_expiracion: membresia.fecha_expiracion,
            activa: accion === 'aceptar' // true para aceptar, false para inhabilitar
        };

        console.log('Enviando al servidor:', JSON.stringify(membresiaLimpia, null, 2));

        // Actualizar la membresía usando PUT
        const response = await fetch(`${BASE_URL}usuario-membresia/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(membresiaLimpia)
        });

        if (response.ok) {
            alert(`Membresía ${accion === 'aceptar' ? 'aceptada' : 'inhabilitada'} correctamente.`);
            location.reload();
        } else {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            alert(`Error: ${errorText || `No se pudo ${accion === 'aceptar' ? 'aceptar' : 'inhabilitar'} la membresía.`}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
    }
};
