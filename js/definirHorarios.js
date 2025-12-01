import { BASE_URL } from "./api_url.js";

document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    if (!userId || !token) window.location.href = "../login.html";

    // ========================
    // 1. Cargar horarios disponibles desde BD
    // ========================
    const res = await fetch(`${BASE_URL}horaEntrega`, {
        headers: { "Authorization": token }
    });
    const horarios = await res.json();

    const cont = document.getElementById("lista-horarios");
    horarios.forEach(h => {
        let horaFormateada = h.hora;
        let ciclo = '';
        if(h.hora < 10){
            horaFormateada = "0" + h.hora;
            ciclo = "AM";
        } else if(h.hora < 12){
            ciclo = "AM";
        } else {
            ciclo = "PM";
        }

        cont.innerHTML += `
            <div class="form-check col-md-3">
                <input class="form-check-input" type="checkbox" value="${h.id_horario}" id="horario-${h.id_horario}">
                <label class="form-check-label" for="horario-${h.id_horario}">
                    ${horaFormateada}:00 ${ciclo}
                </label>
            </div>
        `;
    });

    // ========================
    // 2. Guardar horarios seleccionados
    // ========================
    document.getElementById("formHorarios").addEventListener("submit", async (e) => {
        e.preventDefault();

        const seleccionados = [...document.querySelectorAll(".form-check-input:checked")]
            .map(chk => parseInt(chk.value));

        const body = {
            id_usuario: parseInt(userId),
            horarios: seleccionados
        };

        const resSave = await fetch(`${BASE_URL}horaEntrega`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(body)
        });

        if (resSave.ok) {
            alert("Horarios guardados correctamente");
            cargarHorariosActivos(); // refrescar sección de horarios activos
        } else {
            alert("Error al guardar horarios");
        }
    });

    // ========================
    // 3. Mostrar horarios activos
    // ========================
    async function cargarHorariosActivos() {
        const contActivos = document.getElementById("horarios-activos");
        contActivos.innerHTML = ''; // limpiar

        try {
            const resActivos = await fetch(`${BASE_URL}horaEntrega/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!resActivos.ok) throw new Error("Error al cargar horarios activos");

            const horariosActivos = await resActivos.json();

            console.log(horariosActivos)

            if (horariosActivos.length === 0) {
                contActivos.innerHTML = `<p class="text-muted">No tienes horarios activos.</p>`;
                return;
            }

            horariosActivos.forEach(h => {
                let horaFormateada = h.hora;
                let ciclo = '';
                if(h.hora < 10){
                    horaFormateada = "0" + h.hora;
                    ciclo = "AM";
                } else if(h.hora < 12){
                    ciclo = "AM";
                } else {
                    ciclo = "PM";
                }

                const div = document.createElement('div');
                div.className = 'col-md-3 mb-3';
                div.innerHTML = `
                    <div class="card text-center">
                        <div class="card-body">
                            <p class="card-text mb-2">${horaFormateada}:00 ${ciclo}</p>
                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${h.id_horario}">Eliminar</button>
                        </div>
                    </div>
                `;
                contActivos.appendChild(div);
            });

            // Eventos de eliminar
            document.querySelectorAll(".btn-eliminar").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const idHorario = btn.dataset.id;
                    const resDelete = await fetch(`${BASE_URL}horaEntrega/${idHorario}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (resDelete.ok) {
                        alert("Horario eliminado");
                        cargarHorariosActivos();
                    } else {
                        alert("Error al eliminar horario");
                    }
                });
            });

        } catch (err) {
            console.error(err);
            contActivos.innerHTML = `<p class="text-danger">No se pudieron cargar los horarios activos.</p>`;
        }
    }

    // Cargar horarios activos al inicio
    cargarHorariosActivos();
});
