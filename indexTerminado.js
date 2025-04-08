

document.getElementById("registroForm").addEventListener("submit", function(e) {
  e.preventDefault();
   
  const registros = [];
  const nombre = document.getElementById("nombre").value.trim();
  const cajas = parseInt(document.getElementById("cajas").value);
  const carpetas = parseInt(document.getElementById("carpetas").value);
  const fechaInput = document.getElementById("fecha").value;

  registros.push(nombre, cajas, carpetas, fechaInput)

  recorrer(registros)
  recorrerPorMap(registros)

});

