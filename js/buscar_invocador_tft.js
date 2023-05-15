/* INFO DE LA API */
const API_KEY = "RGAPI-5cced285-500e-45fd-9e3d-577810f27713";
const BASE_URL = "https://la2.api.riotgames.com";
const BASE_URL_MATCH = "https://americas.api.riotgames.com";

/*CONSTANTE PARA ACCEDER AL CONTENIDO DEL INPUT */
const summonerName = document.getElementById("summonerName");

/* CONSTANTES VARIAS */
const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevenir que la página se recargue al enviar el formulario
  getSummonerInfo();
});

//FUNCION QUE OBTIENE INFORMACION BASICA DEL JUGADOR (NOMBRE, NIVEL, SUMMONERID)
function getSummonerInfo() {
  event.preventDefault();
  // Limpia la tabla antes de mostrar los nuevos resultados
  const resultadoBody = document.getElementById("resultado-body");
  resultadoBody.innerHTML = "";
  const url = `${BASE_URL}/tft/summoner/v1/summoners/by-name/${summonerName.value}?api_key=${API_KEY}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const summonerId = data.id;
      const puuid = data.puuid;
      //CONSTANTE QUE GUARDA EL VALOR OBTENIDO DE LA FUNCION getSummonerIcon PARA MOSTRAR EL ICONO DEL JUGADOR
      const imageUrl = getSummonerIcon(
        `https://ddragon.leagueoflegends.com/cdn/11.6.1/img/profileicon/${data.profileIconId}.png`
      );
      document.getElementById("icono-img").src = imageUrl;
      getSummonerRank(data, summonerId);
      getSummonerMatchs(puuid);
    })
    .catch((error) => console.error(error));
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
    .catch((error) => console.error(error));
}

//FUNCION QUE RECIBE EL PUUID OBTENIDO MEDIANTE LA FUNCION getSummonerInfo Y MEDIANTE ESTE OBTIENE LOS MATCHID
function getSummonerMatchs(puuid) {
  fetch(
    `${BASE_URL_MATCH}/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      //BUCLE FOR QUE RECORRE EL ARRAY CON LOS MATCHSID (MAXIMO 20)
      for (i = 0; i < 5; i++) {
        let matchId = data[i];
        getSummonerMatchsInfo(matchId, puuid);
      }
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

// Función que limpia la tabla
function clearTable() {
  const resultadoBody = document.getElementById("resultado-body");
  resultadoBody.innerHTML = "";
}
//--------------------------------
