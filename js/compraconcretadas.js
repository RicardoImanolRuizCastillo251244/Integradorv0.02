import { BASE_URL } from "./api_url.js";

// Variables globales para almacenar datos del reporte
let idVendedorActual = null;
let vendedorNombreActual = null;
let productoNombreActual = null;

// Función para configurar la navegación de los tabs según el rol
function configurarNavegacionTabs(rol) {
    console.log('Configurando tabs en compraconcretadas para rol:', rol);
    
    const comprasTab = document.getElementById('compras');
    const estadisticasTab = document.getElementById('estadisticas');
    const membresiaTab = document.getElementById('membresia');
    const informacionTab = document.getElementById('informacion');
    
    // Configurar tab de información (siempre igual para todos)
    if (informacionTab) {
        informacionTab.onclick = null;
        informacionTab.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'infousuario.html';
        });
    }
    
    if (rol == "2" || rol === 2) {
        // Usuario VENDEDOR - este archivo NO debería ser accesible
        console.warn('Un vendedor está accediendo a compraconcretadas.html - redirigiendo a ventas');
        // Redirigir a ventas
        window.location.href = './vendedor/ventas.html';
        return;
        
    } else if (rol == "1" || rol === 1) {
        // Usuario CONSUMIDOR
        console.log('Vista correcta: CONSUMIDOR viendo sus compras');
        
        // Ocultar tabs de vendedor
        if (estadisticasTab) estadisticasTab.style.display = 'none';
        if (membresiaTab) membresiaTab.style.display = 'none';
        
        // El tab "Compras" ya está en la página actual, solo marcarlo como activo
        if (comprasTab) {
            comprasTab.classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem("rol");
    
    // Configurar navegación de tabs según el rol
    configurarNavegacionTabs(rol);
    
    // 1. Configuración de UI según rol
    configurarVistaPorRol();

    // 2. Iniciar carga de datos
    fetchVenta();

    // 3. Configurar botón regresar
    const returnButton = document.getElementById("return");
    if (returnButton) {
        returnButton.addEventListener("click", () => {
            window.location.href = '../index.html';
        });
    }
});

function configurarVistaPorRol() {
    const rol = localStorage.getItem("rol");
    console.log('Rol del usuario:', rol); // Debug
    
    const membresia = document.getElementById('membresia');
    const estadisticas = document.getElementById('estadisticas');
    const btnPublicar = document.getElementById('buttonPost'); 

    if (rol == "1") { // Consumidor (comparación con string)
        console.log('Usuario es CONSUMIDOR - ocultando membresía y estadísticas');
        if (membresia) {
            membresia.style.display = 'none';
            console.log('Membresía ocultada');
        }
        if (estadisticas) {
            estadisticas.style.display = 'none';
            console.log('Estadísticas ocultadas');
        }
    } else if (rol == "2") { // Vendedor
        console.log('Usuario es VENDEDOR');
        if (btnPublicar) btnPublicar.style.display = 'none';
    }
}

async function fetchVenta() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    if (!userId) {
        mostrarError("No has iniciado sesión.");
        return;
    }
    
    try {
        console.log('Iniciando fetch de ventas...');
        const response = await fetch(`${BASE_URL}compras/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Id': userId
            }
        });

        if (response.ok) {
            const ventas = await response.json();
            console.log('Ventas recibidas:', ventas);
            mostrarTabla(ventas);
        } else {
            const errorText = await response.text();
            console.error('Error backend:', errorText);
            mostrarError(`No se pudieron cargar las compras. (${response.status})`);
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError('Error de conexión con el servidor.');
    }
}

function mostrarTabla(compras) {
    const tablaContainer = document.getElementById("tabla-concretadas");
    if (!tablaContainer) return;
    
    // Verificar si hay ventas
    if (!compras || compras.length === 0) {
        tablaContainer.classList.remove('d-none');
        tablaContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h3 class="text-muted">No tienes compras aún</h3>
                <p class="text-secondary">¡Explora el catálogo y realiza tu primera compra!</p>
                <a href="../index.html" class="btn btn-outline-primary mt-2">Ir al inicio</a>
            </div>
        `;
        return;
    }

    const tbody = tablaContainer.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    compras.forEach((compra) => {
        // DEBUG: Ver qué propiedades tiene cada compra
        console.log('Propiedades de compra:', Object.keys(compra));
        console.log('Compra completa:', compra);
        
        // Formatear Fecha
        let fechaStr = "Fecha desconocida";
        if (compra.fechaVenta && Array.isArray(compra.fechaVenta)) {
            // [año, mes, dia, hora, minuto, segundo]
            const [anio, mes, dia, hora, min] = compra.fechaVenta;
            const minStr = min < 10 ? '0' + min : min;
            fechaStr = `${dia}/${mes}/${anio} <br> <small>${hora}:${minStr} hrs</small>`;
        }

        // Procesar Imagen
        const imageSrc = procesarImagen(compra.fotoPublicacion);
        
        // Tipo de pago
        const tipoPago = compra.tipoPago || 'No especificado';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><h3 class="fuenteTabla fw-bold">${compra.vendedorNombre || 'Desconocido'}</h3></td>
            <td><h3 class="fuenteTabla">${compra.tituloPublicacion || 'Producto eliminado'}</h3></td>
            <td><h3 class="fuenteTabla text-success">$${compra.precioTotal}</h3></td>
            <td><h3 class="fuenteTabla">${compra.cantidadVendida}</h3></td>
            <td>
                <span class="badge ${tipoPago === 'Transferencia' ? 'bg-primary' : 'bg-success'}">
                    ${tipoPago}
                </span>
            </td>
            <td>
                <a href="/pages/comprar.html?id=${compra.idPublicacion}">    
                    <img src="${imageSrc}" class="img-tabla rounded" alt="Producto" style="width: 60px; height: 60px; object-fit: cover;">
                </a>
            </td>
            <td><h3 class="fuenteTabla">${fechaStr}</h3></td>
            <td>
                <button class="btn btn-sm btn-warning btn-reportar-compra" 
                        data-id-publicacion="${compra.idPublicacion}"
                        data-vendedor="${compra.vendedorNombre}" 
                        data-producto="${compra.tituloPublicacion}"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalReportarCompra">
                    <i class="fas fa-exclamation-triangle"></i> Reportar
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    tablaContainer.classList.remove('d-none');
}

// Delegación de eventos para los botones de reportar
// Se ejecuta FUERA de mostrarTabla para que siempre esté activo
document.addEventListener('click', async function(e) {
    const btn = e.target.closest('.btn-reportar-compra');
    if (btn) {
        e.preventDefault();
        e.stopPropagation();
        
        const idPublicacion = btn.getAttribute('data-id-publicacion');
        vendedorNombreActual = btn.getAttribute('data-vendedor');
        productoNombreActual = btn.getAttribute('data-producto');
        
        console.log('✅ Click en reportar detectado');
        console.log('ID Publicación:', idPublicacion);
        console.log('Vendedor:', vendedorNombreActual);
        console.log('Producto:', productoNombreActual);
        
        // Obtener el ID del vendedor desde la publicación
        try {
            const response = await fetch(`${BASE_URL}publicacion/${idPublicacion}`);
            if (response.ok) {
                const publicacion = await response.json();
                idVendedorActual = publicacion.id_vendedor;
                console.log('✅ ID Vendedor obtenido:', idVendedorActual);
                
                // Ahora sí, abrir el modal
                abrirModalReporte();
            } else {
                console.error('❌ Error al obtener publicación');
                alert('No se pudo obtener la información del vendedor. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error de conexión. Intenta de nuevo.');
        }
    }
});

// Función para abrir y configurar el modal
function abrirModalReporte() {
    // Limpiar y actualizar el modal
    document.getElementById('modal-tipo-problema').value = '';
    document.getElementById('modal-descripcion-problema').value = '';
    document.getElementById('modal-evidencia-problema').value = '';
    
    const preview = document.getElementById('modal-preview');
    if (preview) preview.style.display = 'none';
    
    const infoContexto = document.getElementById('modal-info-contexto');
    if (infoContexto) {
        infoContexto.innerHTML = `Reportando compra de "<strong>${productoNombreActual}</strong>" al vendedor <strong>${vendedorNombreActual}</strong>`;
    }
    
    // Abrir el modal manualmente
    const modalElement = document.getElementById('modalReportarCompra');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('✅ Modal abierto');
    } else {
        console.error('❌ No se encontró el modal #modalReportarCompra');
    }
}

function procesarImagen(foto) {
    if (!foto) return 'https://via.placeholder.com/60?text=Sin+Img';
    
    try {
        if (Array.isArray(foto)) {
            const uint8 = new Uint8Array(foto);
            let binary = '';
            for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
            return `data:image/jpeg;base64,${btoa(binary)}`;
        }
        if (typeof foto === 'string') {
            return foto.startsWith('data:image') ? foto : `data:image/jpeg;base64,${foto}`;
        }
    } catch (e) {
        console.warn("Error procesando imagen", e);
    }
    return 'https://via.placeholder.com/60?text=Error';
}

function mostrarError(msg) {
    const tablaContainer = document.getElementById("tabla-concretadas");
    if (tablaContainer) {
        tablaContainer.classList.remove('d-none');
        tablaContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                <h3 class="text-danger">Ocurrió un error</h3>
                <p class="text-secondary">${msg}</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

// Manejo de contador de caracteres y vista previa de imagen
document.addEventListener('DOMContentLoaded', () => {
    // Contador de caracteres
    const descripcionTextarea = document.getElementById('modal-descripcion-problema');
    const charCount = document.getElementById('modal-char-count');
    
    if (descripcionTextarea && charCount) {
        descripcionTextarea.addEventListener('input', () => {
            const count = descripcionTextarea.value.length;
            charCount.textContent = `${count} caracteres`;
            charCount.classList.toggle('text-danger', count > 0 && count < 20);
            charCount.classList.toggle('text-success', count >= 20);
        });
    }
    
    // Vista previa de imagen
    const evidenciaInput = document.getElementById('modal-evidencia-problema');
    const preview = document.getElementById('modal-preview');
    
    if (evidenciaInput && preview) {
        evidenciaInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen es muy grande. Máximo 5MB.');
                    evidenciaInput.value = '';
                    preview.style.display = 'none';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
    }
});

// Función para enviar queja de usuario (reportar al vendedor)
window.enviarQuejaCompra = async function() {
    console.log('🚀 Iniciando envío de queja de usuario');
    
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        alert('Debes iniciar sesión para enviar un reporte.');
        window.location.href = '../pages/login.html';
        return;
    }
    
    const motivo = document.getElementById('modal-tipo-problema').value.trim();
    const descripcion = document.getElementById('modal-descripcion-problema').value.trim();
    const evidenciaFile = document.getElementById('modal-evidencia-problema').files[0];
    
    console.log('Valores obtenidos:');
    console.log('- idVendedorActual (id_receptor):', idVendedorActual);
    console.log('- userId (id_emisor):', userId);
    console.log('- motivo:', motivo);
    console.log('- descripcion length:', descripcion.length);
    console.log('- evidenciaFile:', evidenciaFile ? evidenciaFile.name : 'sin archivo');
    
    // Validaciones
    if (!motivo) {
        alert('Por favor escribe el motivo de tu queja');
        return;
    }
    
    if (descripcion.length < 20) {
        alert('La descripción debe tener al menos 20 caracteres');
        return;
    }
    
    if (!idVendedorActual) {
        alert('Error: No se pudo identificar al vendedor. Intenta de nuevo.');
        console.error('❌ idVendedorActual está vacío');
        return;
    }
    
    // Construir FormData para queja-usuario
    const formData = new FormData();
    formData.append('id_emisor', userId);
    formData.append('id_receptor', idVendedorActual);  // El vendedor es el receptor
    formData.append('descripcion_queja', descripcion);
    formData.append('motivo_queja', motivo);
    
    if (evidenciaFile) {
        // Validar tamaño de archivo
        if (evidenciaFile.size > 5 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 5MB.');
            return;
        }
        formData.append('imagen', evidenciaFile);
    }
    
    // Mostrar loading en el botón
    const btnEnviar = document.querySelector('#modalReportarCompra .btn-danger');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    
    try {
        console.log('📤 Enviando petición a queja-usuario...');
        const response = await fetch(`${BASE_URL}queja-usuario`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Id': userId
            },
            body: formData
        });
        
        console.log('📥 Respuesta recibida. Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Queja enviada exitosamente:', data);
            
            // Crear notificación para el administrador
            await crearNotificacionAdmin(data.id, token, userId);
            
            alert('✅ Reporte enviado exitosamente. Los administradores lo revisarán.');
            
            // Cerrar modal
            const modalElement = document.getElementById('modalReportarCompra');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            
            // Limpiar formulario
            document.getElementById('modal-tipo-problema').value = '';
            document.getElementById('modal-descripcion-problema').value = '';
            document.getElementById('modal-evidencia-problema').value = '';
            const preview = document.getElementById('modal-preview');
            if (preview) preview.style.display = 'none';
            
            // Recargar la tabla
            fetchVenta();
        } else {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            alert(`Error al enviar el reporte: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        alert('Error de conexión al enviar el reporte. Verifica tu conexión a internet.');
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
    }
}

// Función auxiliar para crear notificación para el administrador
async function crearNotificacionAdmin(idQueja, authToken, userId) {
    try {
        const idAdmin = '1'; // ID del administrador

        const notificacionData = {
            id_usuario: idAdmin,
            tipo: 'QUEJA_USUARIO',
            mensaje: `Nueva queja de usuario reportada (ID: ${idQueja})`,
            leida: false
        };

        const response = await fetch(BASE_URL + 'notificacion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'User-Id': userId
            },
            body: JSON.stringify(notificacionData)
        });

        if (response.ok) {
            console.log('✅ Notificación creada para el administrador');
        } else {
            console.warn('⚠️ No se pudo crear notificación para el admin:', await response.text());
        }
    } catch (error) {
        console.error('❌ Error al crear notificación:', error);
    }
}

