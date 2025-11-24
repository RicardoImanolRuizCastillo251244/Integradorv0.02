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
