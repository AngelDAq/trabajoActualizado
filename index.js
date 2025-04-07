document.addEventListener("DOMContentLoaded", function () {
    cargarDatosGuardados();
});

function guardarDatos(nombre, caja, carpetas) {
    let fechaInput = document.getElementById("fecha").value;
    let fecha = fechaInput ? new Date(fechaInput).toLocaleDateString() : new Date().toLocaleDateString();
    let array = [nombre, caja, carpetas, fecha];
    creacionPlantillaElementos(array);
}

function creacionPlantillaElementos(elementosAlmacenados) {
    let info = document.getElementById("mostrarInfo");

    let div = document.createElement("div");
    div.classList.add("registro", "list-group-item");

    div.innerHTML = `
        <span><strong>Nombre:</strong> ${elementosAlmacenados[0]}</span>
        <span><strong>Cajas:</strong> ${elementosAlmacenados[1]}</span>
        <span><strong>Carpetas:</strong> ${elementosAlmacenados[2]}</span>
        <span><strong>Fecha:</strong> ${elementosAlmacenados[3]}</span>
        <button class="btn btn-success btn-sm botonElemento">Guardar</button>
        <button class="btn btn-danger btn-sm botonElementoEliminar">Eliminar</button>
    `;

    info.appendChild(div);
}

function eliminarDatos(e) {
    let registro = e.target.closest(".registro");
    if (!registro) return;

    let nombre = registro.querySelector("span:nth-child(1)").textContent.replace("Nombre: ", "").trim();
    let cajas = registro.querySelector("span:nth-child(2)").textContent.replace("Cajas: ", "").trim();
    let carpetas = registro.querySelector("span:nth-child(3)").textContent.replace("Carpetas: ", "").trim();
    let fecha = registro.querySelector("span:nth-child(4)").textContent.replace("Fecha: ", "").trim();

    registro.remove();

    let datosPrevios = JSON.parse(localStorage.getItem("datosGuardados")) || [];
    let datosActualizados = datosPrevios.filter(
        (dato) => !(dato.nombre === nombre && dato.cajas === cajas && dato.carpetas === carpetas && dato.fecha === fecha)
    );

    localStorage.setItem("datosGuardados", JSON.stringify(datosActualizados));
    mostrarMensaje("Registro eliminado correctamente", "danger");
}

function guardarDatosLocal(e) {
    let registro = e.target.closest(".registro");

    let nombre = registro.querySelector("span:nth-child(1)").textContent.replace("Nombre: ", "").trim();
    let cajas = registro.querySelector("span:nth-child(2)").textContent.replace("Cajas: ", "").trim();
    let carpetas = registro.querySelector("span:nth-child(3)").textContent.replace("Carpetas: ", "").trim();
    let fecha = registro.querySelector("span:nth-child(4)").textContent.replace("Fecha: ", "").trim();

    let nuevoDato = { nombre, cajas, carpetas, fecha };

    let datosPrevios = JSON.parse(localStorage.getItem("datosGuardados")) || [];
    datosPrevios.push(nuevoDato);
    localStorage.setItem("datosGuardados", JSON.stringify(datosPrevios));

    mostrarMensaje("Datos guardados correctamente", "success");
}

function mostrarMensaje(mensaje, tipo) {
    let alerta = document.createElement("div");
    alerta.classList.add("alert", `alert-${tipo}`, "mt-2", "text-center");
    alerta.textContent = mensaje;

    document.getElementById("mostrarInfo").prepend(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function cargarDatosGuardados() {
    let datosString = localStorage.getItem("datosGuardados");
    let datosPrevios = [];

    try {
        datosPrevios = JSON.parse(datosString);
        if (!Array.isArray(datosPrevios)) {
            datosPrevios = [];
        }
    } catch (error) {
        datosPrevios = [];
    }

    datosPrevios.forEach((dato) => {
        creacionPlantillaElementos([dato.nombre, dato.cajas, dato.carpetas, dato.fecha]);
    });
}

document.getElementById("enviado").addEventListener("click", (e) => {
    e.preventDefault();
    guardarDatos(
        document.getElementById("nombrePersona").value,
        document.getElementById("totalCajas").value,
        document.getElementById("totalCarpetas").value
    );
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("botonElemento")) {
        guardarDatosLocal(e);
    } else if (e.target.classList.contains("botonElementoEliminar")) {
        eliminarDatos(e);
    }
});

document.getElementById("exportarExcel").addEventListener("click", () => {
    let datos = JSON.parse(localStorage.getItem("datosGuardados")) || [];

    if (datos.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Hoja 1: Registros
    let registros = [["Nombre", "Cajas", "Carpetas", "Fecha"]];
    datos.forEach(dato => {
        registros.push([dato.nombre, dato.cajas, dato.carpetas, dato.fecha]);
    });

    // Hoja 2: Resumen por persona y mes
    let resumenPorPersonaMes = {};

    datos.forEach(dato => {
        let fecha = new Date(dato.fecha);
        let mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        let clave = `${dato.nombre}-${mes}`;

        if (!resumenPorPersonaMes[clave]) {
            resumenPorPersonaMes[clave] = {
                nombre: dato.nombre,
                mes: mes,
                cajas: 0,
                carpetas: 0
            };
        }

        resumenPorPersonaMes[clave].cajas += parseInt(dato.cajas);
        resumenPorPersonaMes[clave].carpetas += parseInt(dato.carpetas);
    });

    let resumenExcel = [["Nombre", "Mes", "Total Cajas", "Total Carpetas"]];
    for (let clave in resumenPorPersonaMes) {
        let persona = resumenPorPersonaMes[clave];
        resumenExcel.push([persona.nombre, persona.mes, persona.cajas, persona.carpetas]);
    }

    // Crear Excel
    let wb = XLSX.utils.book_new();
    let ws1 = XLSX.utils.aoa_to_sheet(registros);
    let ws2 = XLSX.utils.aoa_to_sheet(resumenExcel);

    XLSX.utils.book_append_sheet(wb, ws1, "Registros");
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen x Persona");

    XLSX.writeFile(wb, "InventarioPorPersona.xlsx");
});
