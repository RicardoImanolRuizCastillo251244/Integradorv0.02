document.addEventListener('DOMContentLoaded', async () => {
    const contenedorMembresias = document.querySelector('.contenido');
    const btnPagar = document.querySelector('.btn-pagar');

    // Validar login
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
        alert('Debes iniciar sesión para ver los planes.');
        window.location.href = 'login.html';
        return;
    }

    // Cargar planes
    try {
        const response = await fetch('http://localhost:7000/membresia-tipo');
        if (response.ok) {
            const planes = await response.json();
            renderPlanes(planes);
        } else {
            contenedorMembresias.innerHTML = '<p>Error al cargar planes de membresía.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        contenedorMembresias.innerHTML = '<p>Error de conexión al cargar planes.</p>';
    }

    function renderPlanes(planes) {
        // Limpiar contenido actual (excepto título si está dentro)
        // Mantenemos el título h2
        const titulo = contenedorMembresias.querySelector('h2');
        contenedorMembresias.innerHTML = '';
        if (titulo) contenedorMembresias.appendChild(titulo);

        if (planes.length === 0) {
            contenedorMembresias.innerHTML += '<p>No hay planes disponibles.</p>';
            return;
        }

        planes.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'membresia-card';
            card.innerHTML = `
                <div class="precio">$${plan.precio}</div>
                <h3>${plan.nombre_membresia}</h3>
                <p>${plan.descripcion}</p>
                <p><strong>Duración:</strong> ${plan.duracion_dias} días</p>
                <input type="radio" name="membresia" value="${plan.id_membresia_tipo}">
            `;
            contenedorMembresias.appendChild(card);
        });

        // Re-agregar el botón de pagar al final
        contenedorMembresias.appendChild(btnPagar);
    }

    // Manejar click en pagar
    btnPagar.addEventListener('click', async (e) => {
        e.preventDefault();

        const seleccionado = document.querySelector('input[name="membresia"]:checked');
        if (!seleccionado) {
            alert('Por favor selecciona un plan de membresía.');
            return;
        }

        const idMembresiaTipo = seleccionado.value;

        if (!confirm('¿Estás seguro de que deseas suscribirte a este plan?')) return;

        try {
            const datos = {
                id_usuario: parseInt(userId),
                id_membresia_tipo: parseInt(idMembresiaTipo)
            };

            const response = await fetch('http://localhost:7000/usuario-membresia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                const data = await response.json();
                alert(`¡Membresía activada con éxito! Expira el: ${new Date(data.fecha_expiracion).toLocaleDateString()}`);
                window.location.href = 'infousuario.html'; // Redirigir a perfil
            } else {
                const errorText = await response.text();
                alert(`Error al procesar el pago: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al procesar el pago.');
        }
    });
});
