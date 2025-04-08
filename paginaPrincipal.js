let datosUsuarios = JSON.parse(localStorage.getItem("datosUsuarios")) || [];

document.addEventListener("DOMContentLoaded", () => {
  cargarDatosLocal();
});

document.getElementById("calcularProduccion").addEventListener("click", calcularTotales);

document.getElementById("registros").addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
      let registro = event.target.closest("li");
      let spans = registro.querySelectorAll(".registro-datos span");
      let nombre = spans[0].textContent.split(": ")[1];
      let fecha = spans.length > 2 ? spans[3].textContent.split(": ")[1] : "";
      let busqueda = spans.length === 3;
      let caja = busqueda ? 0 : parseInt(spans[1].textContent.split(": ")[1]) || 0;
      let carpeta = busqueda ? 0 : parseInt(spans[2].textContent.split(": ")[1]) || 0;

      if (event.target.classList.contains("guardarDatos")) {
          datosUsuarios.push({ nombre, caja, carpeta, fecha, busqueda });
          guardarDatos();
          calcularTotales();
          alert("Datos guardados");
      } else if (event.target.classList.contains("eliminarDatos")) {
          datosUsuarios = datosUsuarios.filter(dato => !(dato.nombre === nombre && dato.fecha === fecha && dato.caja === caja && dato.carpeta === carpeta));
          guardarDatos();
          registro.remove();
          calcularTotales();
      }
  }
});

document.getElementById("formularioInventario").addEventListener("submit", (e) => {
  e.preventDefault();
  let nombre = document.getElementById("nombre").value;
  let caja = parseInt(document.getElementById("caja").value) || 0;
  let carpeta = parseInt(document.getElementById("carpetas").value) || 0;
  let fecha = document.getElementById("fecha").value;
  let checkbox = document.getElementById("soloBusqueda").checked;

  if (checkbox) {
      plantillaElementosBusquedas(nombre, fecha);
  } else {
      plantillaElementos(nombre, caja, carpeta, fecha);
  }
  datosUsuarios.push({ nombre, caja, carpeta, fecha, busqueda: checkbox });
  guardarDatos();
  calcularTotales();
});

function plantillaElementos(nombre, caja, carpeta, fecha) {
  let elementoIndexRegistro = document.getElementById("registros");
  let filaRegistro = document.createElement("li");
  filaRegistro.classList.add("registro-item");
  filaRegistro.innerHTML = `
      <div class="registro-datos">
          <span><strong>Nombre:</strong> ${nombre}</span>
          <span><strong>Total Cajas:</strong> ${caja}</span>
          <span><strong>Total Carpetas:</strong> ${carpeta}</span>
          <span><strong>Fecha:</strong> ${fecha}</span>
      </div>
      <div class="registro-botones">
          <button class="guardarDatos">Guardar Datos</button>
          <button class="eliminarDatos">Eliminar Datos</button>
      </div>`;
  elementoIndexRegistro.appendChild(filaRegistro);
}

function plantillaElementosBusquedas(nombre, fecha) {
  let elementoIndexRegistro = document.getElementById("registros");
  let filaRegistro = document.createElement("li");
  filaRegistro.classList.add("registro-item");
  filaRegistro.innerHTML = `
      <div class="registro-datos">
          <span><strong>Nombre:</strong> ${nombre}</span>
          <span><strong>Fecha:</strong> ${fecha}</span>
          <span><strong>Búsqueda de cajas y carpetas</strong></span>
      </div>
      <div class="registro-botones">
          <button class="guardarDatos">Guardar Datos</button>
          <button class="eliminarDatos">Eliminar Datos</button>
      </div>`;
  elementoIndexRegistro.appendChild(filaRegistro);
}

function guardarDatos() {
  localStorage.setItem("datosUsuarios", JSON.stringify(datosUsuarios));
}

function cargarDatosLocal() {
  let datosGuardados = JSON.parse(localStorage.getItem("datosUsuarios")) || [];
  let elementoIndexRegistro = document.getElementById("registros");
  elementoIndexRegistro.innerHTML = "";
  datosGuardados.forEach(({ nombre, caja, carpeta, fecha, busqueda }) => {
      if (busqueda) {
          plantillaElementosBusquedas(nombre, fecha);
      } else {
          plantillaElementos(nombre, caja, carpeta, fecha);
      }
  });
  datosUsuarios = datosGuardados;
  calcularTotales();
}

function calcularTotales() {
  let totalesPorPersona = {};
  datosUsuarios.forEach(({ nombre, caja, carpeta, busqueda }) => {
      if (!busqueda) {
          if (!totalesPorPersona[nombre]) {
              totalesPorPersona[nombre] = { cajas: 0, carpetas: 0 };
          }
          totalesPorPersona[nombre].cajas += caja;
          totalesPorPersona[nombre].carpetas += carpeta;
      }
  });
  
  let totalElementos = document.getElementById("totalPorPersona");
  if (!totalElementos) {
      totalElementos = document.createElement("ul");
      totalElementos.id = "totalPorPersona";
      document.body.appendChild(totalElementos);
  }
  totalElementos.innerHTML = "";
  for (let persona in totalesPorPersona) {
      let item = document.createElement("li");
      item.textContent = `${persona} - Cajas: ${totalesPorPersona[persona].cajas}, Carpetas: ${totalesPorPersona[persona].carpetas}`;
      totalElementos.appendChild(item);
  }
}

document.getElementById("soloBusqueda").addEventListener("change", ejecucionToggle);
function ejecucionToggle() {
  let checkbox = document.getElementById("soloBusqueda");
  let caja = document.getElementById("caja");
  let carpeta = document.getElementById("carpetas");

  caja.disabled = checkbox.checked;
  carpeta.disabled = checkbox.checked;
}

