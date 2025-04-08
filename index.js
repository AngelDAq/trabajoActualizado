document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const mostrarInfo = document.getElementById("mostrarInfo");
    const exportarExcel = document.getElementById("exportarExcel");

    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    function guardarLocal() {
        localStorage.setItem("registros", JSON.stringify(registros));
    }

    function eliminarRegistro(index) {
        registros.splice(index, 1);
        guardarLocal();
        mostrarRegistros();
    }

    function mostrarRegistros() {
        mostrarInfo.innerHTML = "";

        const registrosPorPersona = {};

        registros.forEach(({ nombre, cajas, carpetas, fecha }, index) => {
            if (!registrosPorPersona[nombre]) {
                registrosPorPersona[nombre] = [];
            }
            registrosPorPersona[nombre].push({ cajas, carpetas, fecha, index });
        });

        for (const nombre in registrosPorPersona) {
            const div = document.createElement("div");
            div.classList.add("persona");

            const titulo = document.createElement("h5");
            titulo.textContent = nombre;
            div.appendChild(titulo);

            const lista = document.createElement("ul");
            registrosPorPersona[nombre].forEach(({ cajas, carpetas, fecha, index }) => {
                const item = document.createElement("li");

                item.innerHTML = `📦 Cajas: ${cajas} | 📁 Carpetas: ${carpetas} | 📅 Fecha: ${fecha || "No indicada"} 
                    <button class="eliminar" data-index="${index}">🗑️</button>`;

                lista.appendChild(item);
            });

            div.appendChild(lista);
            mostrarInfo.appendChild(div);
        }

        document.querySelectorAll(".eliminar").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = btn.getAttribute("data-index");
                eliminarRegistro(index);
            });
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("nombrePersona").value.trim();
        const cajas = parseInt(document.getElementById("totalCajas").value);
        const carpetas = parseInt(document.getElementById("totalCarpetas").value);
        const fecha = document.getElementById("fecha").value;

        if (!nombre || isNaN(cajas) || isNaN(carpetas)) {
            alert("Por favor completa todos los campos requeridos.");
            return;
        }

        registros.push({ nombre, cajas, carpetas, fecha });
        guardarLocal();
        mostrarRegistros();
        form.reset();
    });

    exportarExcel.addEventListener("click", function () {
        const wb = XLSX.utils.book_new();

        // Hoja 1: Inventario
        const hoja1 = XLSX.utils.json_to_sheet(registros);
        XLSX.utils.book_append_sheet(wb, hoja1, "Inventario");

        // Hoja 2: Totales por Persona por Mes
        const totalesPorPersonaMes = {};
        registros.forEach(({ nombre, cajas, carpetas, fecha }) => {
            if (!fecha) return;
            const mes = fecha.substring(0, 7); // yyyy-mm
            const clave = `${nombre}_${mes}`;
            if (!totalesPorPersonaMes[clave]) {
                totalesPorPersonaMes[clave] = { nombre, mes, cajas: 0, carpetas: 0 };
            }
            totalesPorPersonaMes[clave].cajas += cajas;
            totalesPorPersonaMes[clave].carpetas += carpetas;
        });

        const hoja2 = XLSX.utils.json_to_sheet(Object.values(totalesPorPersonaMes));
        XLSX.utils.book_append_sheet(wb, hoja2, "Totales por Persona x Mes");

        // Hoja 3: Totales por Mes General
        const totalesMensuales = {};
        registros.forEach(({ cajas, carpetas, fecha }) => {
            if (!fecha) return;
            const mes = fecha.substring(0, 7); // yyyy-mm
            if (!totalesMensuales[mes]) {
                totalesMensuales[mes] = { mes, cajas: 0, carpetas: 0 };
            }
            totalesMensuales[mes].cajas += cajas;
            totalesMensuales[mes].carpetas += carpetas;
        });

        const hoja3 = XLSX.utils.json_to_sheet(Object.values(totalesMensuales));
        XLSX.utils.book_append_sheet(wb, hoja3, "Totales Mensuales");

        XLSX.writeFile(wb, "inventario.xlsx");
    });

    mostrarRegistros();
});
