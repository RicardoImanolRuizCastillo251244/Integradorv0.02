import { BASE_URL } from "./api_url.js";

const userId = localStorage.getItem('userId');
const rol = localStorage.getItem("rol")


let ventas = [];
let cargando = false; // Prevenir múltiples cargas

document.addEventListener('DOMContentLoaded', () => {
    fetchVenta();
});

async function fetchVenta() {
    // Prevenir múltiples llamadas simultáneas
    if (cargando) {
        console.log('Ya hay una carga en proceso...');
        return;
    }
    
    cargando = true;
    
    try {
        console.log('Iniciando fetch de ventas...');
        const response = await fetch(BASE_URL + 'compras/'+userId);
        console.log('Respuesta status:', response.status);

        if (response.ok) {
            ventas = await response.json();
            console.log('Ventas recibidas:', ventas);
            mostrarTabla(ventas);
        } else {
            console.error('Error al obtener ventas. Status:', response.status);
            mostrarError();
        }
    } catch (error) {
        console.error('Error de red:', error);
        mostrarError();
    } finally {
        cargando = false;
    }
}

const membresia = document.getElementById('membresia')
    const estadisticas = document.getElementById('estadisticas')
    const btnPublicar = document.getElementById('buttonPost')

    if (rol == 1) {
        membresia.hidden = true;
        estadisticas.hidden = true;
    }
    else{
        btnPublicar.hidden=true
    }

    

function mostrarTabla(compras) {
    const tablaContainer = document.getElementById("tabla-concretadas");
    
    if (!tablaContainer) {
        console.error('No se encontró el contenedor de tabla');
        return;
    }
    
    // Verificar si hay ventas
    if (!compras || compras.length === 0) {
        console.log('No hay compras para mostrar');
        tablaContainer.classList.remove('d-none');
        tablaContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h3 class="text-muted">No hay compras concretadas</h3>
                <p class="text-secondary">Aún no has realizado ninguna compra</p>
            </div>
        `;
        return;
    }

    // Buscar el tbody existente
    const tbody = tablaContainer.querySelector('tbody');
    
    if (!tbody) {
        console.error('No se encontró el tbody en la tabla');
        return;
    }

    // Limpiar contenido existente
    tbody.innerHTML = '';

    let str = ""
    let dia=""
    let mes=""
    let anio=""
    let hrs=""
    let min=""

    // Construir las filas de la tabla
    compras.forEach((compra, index) => {
        
        console.log(`Procesando venta ${index + 1}:`, compra);
        
        const fila = document.createElement('tr');
        
        let fechaFormateada = compra.fechaVenta;
        try {
            if (fechaFormateada) {
                anio=fechaFormateada[0]
                mes=fechaFormateada[1]
                dia=fechaFormateada[2]
                hrs=fechaFormateada[3]
                min=fechaFormateada[4]
                if(min<10){
                    console.log("HOLA")
                    min="0"+fechaFormateada[4]
                }
            }
        } catch (e) {
            console.error('Error al formatear fecha:', e);
        }

        
        let imageSrc = 'https://via.placeholder.com/50x50?text=Sin+Imagen';

        if (compra.fotoPublicacion) {
                // Verificar si es un array de bytes (común en Java BLOB -> JSON)
                if (Array.isArray(compra.fotoPublicacion)) {
                    // Convertir array de bytes a base64
                    const base64String = btoa(String.fromCharCode.apply(null, compra.fotoPublicacion));
                    imageSrc = `data:image/jpeg;base64,${base64String}`;
                } else if (typeof compra.fotoPublicacion === 'string') {
                    // Si ya es string, verificar si tiene prefijo
                    if (compra.fotoPublicacion.startsWith('data:image')) {
                        imageSrc = compra.fotoPublicacion;
                    } else {
                        // Asumir que es base64 sin prefijo
                        imageSrc = `data:image/jpeg;base64,${compra.fotoPublicacion}`;
                    }
                }
            }


        fila.innerHTML = `
            <td><h3 class="fuenteTabla">${compra.vendedorNombre || 'Usuario desconocido'}</h3></td>
            <td><h3 class="fuenteTabla">${compra.tituloPublicacion || 'Sin título'}</h3></td>
            <td><h3 class="fuenteTabla">$${compra.precioTotal || '0'}</h3></td>
            <td><h3 class="fuenteTabla">${compra.cantidadVendida || '0'}</h3></td>
            <td>
            <a href="/pages/comprar.html?id=${compra.idPublicacion}">    
            <img src="${imageSrc}" 
                     class="img-tabla" 
                     alt="Producto"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/50x50?text=Error';">
            </a>
            </td>
            <td><h3 class="fuenteTabla">${dia}-${mes}-${anio}<br>${hrs}:${min}</br></h3></td>
            <td>
                <a href="detalleCompraConcretada.html?id=${compra.idCompra}" 
                   class="ver-detalles">Ver detalles</a>
            </td>
        `;
        
        tbody.appendChild(fila);
    });

    // Remover la clase d-none para mostrar la tabla
    tablaContainer.classList.remove('d-none');
    
    console.log(`✅ Se mostraron ${ventas.length} compra(s) exitosamente`);
}

function mostrarError() {
    const tablaContainer = document.getElementById("tabla-concretadas");
    
    if (!tablaContainer) return;
    
    tablaContainer.classList.remove('d-none');
    tablaContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h3 class="text-danger">Error al cargar las compras</h3>
            <p class="text-secondary">No se pudieron cargar los datos. Intenta nuevamente.</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">
                <i class="fas fa-sync-alt me-2"></i>Reintentar
            </button>
        </div>
    `;
}

// Botón regresar
const returnButton = document.getElementById("return");
if (returnButton) {
    returnButton.addEventListener("click", () => {
        window.location.href = '../index.html';
    });
}

