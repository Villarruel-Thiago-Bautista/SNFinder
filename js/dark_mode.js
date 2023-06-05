// Variables que uso
let toggle = document.getElementById("toggle");
let footer = document.querySelector("footer");
let header = document.querySelector("header");
let title = document.querySelector("h2");

//Evento tipo change con funcion que cambia los valores
toggle.addEventListener("change", (event) => {
  let checked = event.target.checked;

  //Agrego clases para el "modo oscuro" a los elementos
  document.body.classList.toggle("dark");
  footer.classList.toggle("dark");
  header.classList.toggle("dark");
  header.classList.toggle("dark-header");
  title.style.color = "white";

  //Cambio el icono
  if (checked == true) {
    label_toggle.innerHTML = '<i class="fa-solid fa-lightbulb"></i>';
    label_toggle.style.color = "#FDFD96";
  } else {
    label_toggle.innerHTML = '<i class="fa-solid fa-lightbulb"></i>';
    label_toggle.style.color = "#9B9B9B";
  }
});
