import { BASE_URL } from "./api_url.js";
const btncomprar = document.getElementById('btn_comprar');
const btnQueja = document.getElementById('btn_queja')
btncomprar.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        window.location.href = '/pages/pago.html'; 
    } else {
        window.location.href = '/pages/login.html'; 
    }
});

btnQueja.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        window.location.href = '/pages/Queja.html'; 
    } else {
        window.location.href = '/pages/login.html'; 
    }
});


document.addEventListener('DOMContentLoaded', async function (){

    const select = document.getElementById("cantidadSelect");
    const input = document.getElementById("cantidadInput");


select.addEventListener("change", () => {
    if (select.value !== "") {
        input.value = select.value;
    }
    });

    input.addEventListener("input", () => {
        select.value = "";
    });
    
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString); 

    const idObtenido = urlParams.get('id');

    try {
        const response = await fetch(BASE_URL+'publicacion/'+idObtenido)
        const producto = await response.json()
        const responseUser = await fetch(BASE_URL+'usuario/'+producto.id_vendedor)
        const vendedor = await responseUser.json()
        console.log(await producto)
        console.log(vendedor)
        renderProducto(producto)
        renderDetallesVendedor(vendedor)

    } catch (error) {
        console.error('Error de red:', error);
    }

    function renderProducto(producto){
        const descripcion = document.getElementById('card-text')
        const titulo = document.getElementById('card-title')
        const precio = document.getElementById('precio')
        let img = document.getElementById('productoPublicado')
        let imageSrc = " "

        descripcion.textContent = producto.descripcion_publicacion;
        titulo.textContent = producto.titulo_publicacion;
        precio.textContent = "$"+producto.precio_producto;
        console.log(precio)
        if (producto.foto_publicacion) {
                // Verificar si es un array de bytes (común en Java BLOB -> JSON)
                if (Array.isArray(producto.foto_publicacion)) {
                    // Convertir array de bytes a base64
                    const base64String = btoa(String.fromCharCode.apply(null, producto.foto_publicacion));
                    imageSrc = `data:image/jpeg;base64,${base64String}`;
                } else if (typeof producto.foto_publicacion === 'string') {
                    // Si ya es string, verificar si tiene prefijo
                    if (producto.foto_publicacion.startsWith('data:image')) {
                        imageSrc = producto.foto_publicacion;
                    } else {
                        // Asumir que es base64 sin prefijo
                        imageSrc = `data:image/jpeg;base64,${producto.foto_publicacion}`;
                    }
                }
            }
            
        img.src = imageSrc

    }

    function renderDetallesVendedor(vendedor){
        const infor = document.getElementById('vendedor')

        const info = document.createElement('div') 
        info.innerHTML=
                `<h2 id="card-title"></h2>
                <h1 id="precio" class="precio"></h1>

                <p><i id="horario" class="fa-solid fa-clock"></i> Horario de entrega: <strong>00:00</strong></p>
                <p><i class="fa-solid fa-user"></i> ${vendedor.nombre_usuario} </p>
                <p><i id="calificacion" class="fa-solid fa-star"></i> </p>`
        console.log(info)

        infor.appendChild(info)
    }

});
