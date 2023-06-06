// Variables que uso
let toggle = document.getElementById("toggle");
let footer = document.querySelector("footer");
let header = document.querySelector("header");
let title = document.querySelector("h2");
let logoGithub = document.getElementById("logo_github");
let offer = document.getElementById("offer-container");

// Función para establecer el modo actual
function setMode(mode) {
  // Agrego o elimino las clases para el modo oscuro en los elementos
  document.body.classList.toggle("dark", mode === "dark");
  footer.classList.toggle("dark", mode === "dark");
  header.classList.toggle("dark", mode === "dark");
  header.classList.toggle("dark-header", mode === "dark");

  // Cambio el icono
  if (mode === "dark") {
    label_toggle.innerHTML = '<i class="fa-solid fa-lightbulb"></i>';
    label_toggle.style.color = "#FDFD96";

    // Cambio color h2
    title.style.color = "white";

    logoGithub.src = "img/logo-github-white.png";

    // Cambio fondo y color p
    offer.style.backgroundColor = "#333";
    offer.style.color = "white";

    // Menu hamburguesa
    document.querySelector(".menu").style.background = "#333";
    document.querySelectorAll(".menu li a").forEach((link) => {
      link.style.color = "white";
    });
  } else {
    //Icono
    label_toggle.innerHTML = '<i class="fa-solid fa-lightbulb"></i>';
    label_toggle.style.color = "#9B9B9B";

    //H2
    title.style.color = "black";

    //Logo github
    logoGithub.src = "img/logo-github.png";

    //offer
    offer.style.backgroundColor = "#fff";
    offer.style.color = "black";

    //Menu hamburguesa
    document.querySelector(".menu").style.background = "#eee";
    document.querySelectorAll(".menu li a").forEach((link) => {
      link.style.color = "black";
    });
  }
}

// Función para obtener el modo actual
function getMode() {
  const savedMode = localStorage.getItem("mode");
  return savedMode || "light";
}

// Función para cambiar el modo
function toggleMode() {
  const currentMode = getMode();
  const newMode = currentMode === "dark" ? "light" : "dark";
  localStorage.setItem("mode", newMode);
  setMode(newMode);
}

// Evento de cambio de modo
toggle.addEventListener("change", toggleMode);

// Establecer el modo actual al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const currentMode = getMode();
  toggle.checked = currentMode === "dark";
  setMode(currentMode);
});

// Establecer el modo por defecto al cargar la página
if (!localStorage.getItem("mode")) {
  setMode("light");
}
