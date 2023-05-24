/* INFO DE LA API */
const API_KEY = "RGAPI-075b4862-26ee-4a73-9f41-5e09ac6c5b9d";
const BASE_URL = "https://la2.api.riotgames.com";
const BASE_URL_MATCH = "https://americas.api.riotgames.com";

/* CONSTANTES VARIAS */
const searchForm = document.getElementById("search-form");
const summonerName = searchForm.getElementsByTagName("input")[0];
const search_btn = searchForm.getElementsByTagName("button")[0];
console.log(summonerName);

searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // QUE LA PAGINA NO SE RECARGUE AL ENVIAR EL FORMULARIO
  getSummonerInfo();
});

// FUNCION QUE OBTIENE INFORMACION BASICA DEL JUGADOR (NOMBRE, NIVEL, SUMMONERID)
function getSummonerInfo() {
  search_btn.disabled = true;
  summonerName.disabled = true;

  // Ocultar la imagen del "Icono de invocador"
  document.getElementById("icono-invocador").classList.add("oculto");

  // Ocultar el nombre y el nivel del invocador
  document.getElementById("info-summoner").innerHTML = "";

  // Limpia la tabla antes de mostrar los nuevos resultados
  const resultadoBody = document.getElementById("resultado-body");
  resultadoBody.innerHTML = "";

  // Oculta la tabla
  const tablaResultados = document.getElementById("tabla-resultados");
  tablaResultados.classList.add("oculto");

  const url = `${BASE_URL}/tft/summoner/v1/summoners/by-name/${summonerName.value}?api_key=${API_KEY}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status && data.status.status_code === 404) {
        // MOSTRAR MENSAJE EN CASO DE QUE EL JUGADOR NO EXISTA
        showNotFoundMessage();
      } else {
        const summonerId = data.id;
        const puuid = data.puuid;
        const imageUrl = getSummonerIcon(
          `https://ddragon.leagueoflegends.com/cdn/11.6.1/img/profileicon/${data.profileIconId}.png`
        );
        document.getElementById("icono-img").src = imageUrl;

        // MOSTRAR EL ICONO UNA VEZ QUE SE HAYAN CARGADO LOS DATOS
        const iconoInvocador = document.getElementById("icono-invocador");
        iconoInvocador.classList.remove("oculto");

        getSummonerRank(data, summonerId);
        getSummonerMatchs(puuid);

        // MOSTRAR LA TABLA UNA VEZ QUE SE HAYAN CARGADO LOS DATOS
        const tablaResultados = document.getElementById("tabla-resultados");
        tablaResultados.classList.remove("oculto");
      }
    })
    .catch((error) => {
      console.error(error);
      showNotFoundMessage();
    })
    .finally(() => {
      search_btn.disabled = false;
      summonerName.disabled = false;
    });
}

function getSummonerIcon(iconUrl) {
  return iconUrl;
}

//FUNCION QUE RECIBE EL SUMMONER ID OBTENIDO MEDIANTE LA FUNCION getSummonerInfo Y BUSCA LA DIVISIÓN DEL JUGADOR
function getSummonerRank(data, summonerId) {
  const url = `${BASE_URL}/tft/league/v1/entries/by-summoner/${summonerId}?api_key=${API_KEY}`;
  fetch(url)
    .then((response) => response.json())
    .then((rankData) => {
      const rank =
        //VERIFICO SI rankData ES UN ARRAY, SI SU TAMAÑO > 0 Y EL PRIMER VALOR TIENE LA PROPIEDAD .TIER SE LE ASIGNA EL VALOR DEL PRIMER ELEMENTO A LA VARIABLE rank
        Array.isArray(rankData) && rankData.length > 0 && rankData[0].tier
          ? rankData[0]
          : { tier: "Sin rango", rank: "" };
      showSummonerData(data, rank);
    })
    .catch((error) => {
      console.error(error);
    });
}

//FUNCION QUE RECIBE EL PUUID OBTENIDO MEDIANTE LA FUNCION getSummonerInfo Y MEDIANTE ESTE OBTIENE LOS MATCHID
function getSummonerMatchs(puuid) {
  fetch(
    `${BASE_URL_MATCH}/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        //BUCLE FOR QUE RECORRE EL ARRAY CON LOS MATCHSID (MAXIMO 20)
        for (i = 0; i < 5; i++) {
          let matchId = data[i];
          getSummonerMatchsInfo(matchId, puuid);
        }
      }
    })
    .finally(() => {
      summonerName.disabled = false;
      search_btn.disabled = false;
    });
}

//FUNCION QUE RECIBE LOS MATCHID OBTENIDOS MEDIANTE LA FUNCION getSummonerMatchs Y MEDIANTE ESTE OBTIENE LOS DATOS DE LAS PARTIDAS
function getSummonerMatchsInfo(matchId, puuid) {
  fetch(`${BASE_URL_MATCH}/tft/match/v1/matches/${matchId}?api_key=${API_KEY}`)
    .then((response) => response.json())
    .then((dataMatch) => {
      for (i = 0; i < 8; i++) {
        if (dataMatch.info.participants[i].puuid == puuid) {
          placement = dataMatch.info.participants[i].placement;
          players_eliminated =
            dataMatch.info.participants[i].players_eliminated;
          last_round = dataMatch.info.participants[i].last_round;
          showSummonerMatchData(placement, players_eliminated, last_round);
        }
      }
    });
}

//FUNCION QUE RECIBE LOS DATOS OBTENIDOS MEDIANTE LAS FUNCIONES getSummonerInfo y getSummonerRank Y LOS MUESTRA POR PANTALLA.
function showSummonerData(data, rank) {
  const infoSummonerDiv = document.getElementById("info-summoner");
  infoSummonerDiv.innerHTML = `
    <h2>${data.name}</h2>
    <p>Nivel: ${data.summonerLevel}</p>
    <p>Rango: ${rank.tier} ${rank.rank}</p>
  `;
}

//FUNCION QUE RECIBE LOS DATOS DE LAS PARTIDAS Y LOS MUESTRA
function showSummonerMatchData(placement, players_eliminated, last_round) {
  const resultadoBody = document.getElementById("resultado-body");

  // Crear una nueva fila
  const newRow = document.createElement("tr");

  // Crear tres nuevas celdas y agregar el contenido
  const placementCell = document.createElement("td");
  placementCell.textContent = placement;
  newRow.appendChild(placementCell);

  const resultCell = document.createElement("td");
  resultCell.textContent = placement == 1 ? "Victoria" : "Derrota";
  newRow.appendChild(resultCell);

  const playersEliminatedCell = document.createElement("td");
  playersEliminatedCell.textContent = players_eliminated;
  newRow.appendChild(playersEliminatedCell);

  const lastRoundCell = document.createElement("td");
  lastRoundCell.textContent = last_round;
  newRow.appendChild(lastRoundCell);

  // Agregar la nueva fila a la tabla
  resultadoBody.appendChild(newRow);
}

// Obtener el elemento input
const summonerInput = document.getElementById("summoner-input");

// Agregar el event listener al input
summonerInput.addEventListener("keyup", function (event) {
  // Verificar si la tecla presionada fue "Enter"
  if (event.keyCode === 13) {
    // Llamar a la función que limpia la tabla
    clearTable();
  }
});

//FUNCION QUE CREA UN PARRAFO Y UNA IMAGEN, LOS INSERTA Y LOS MUESTRA

function showNotFoundMessage() {
  const mensaje = document.createElement("p");
  mensaje.textContent = "No se encontró la información.";

  const imagen = document.createElement("img");
  imagen.src = "/img/summonerNotFound.png";
  imagen.alt = "Summoner no encontrado";

  const infoSummonerSection = document.getElementById("info-summoner-section");
  infoSummonerSection.appendChild(mensaje);
  infoSummonerSection.appendChild(imagen);
}

// Función que limpia la tabla
function clearTable() {
  const resultadoBody = document.getElementById("resultado-body");
  resultadoBody.innerHTML = "";
}
//--------------------------------
