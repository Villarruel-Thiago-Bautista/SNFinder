/* INFO DE LA API */
const API_KEY = "RGAPI-ef019635-402d-4f9b-bb57-1828c0d8c7ff";

/* CONSTANTES VARIAS */
const searchForm = document.getElementById("search-form");
const summonerName = searchForm.getElementsByTagName("input")[0];
const search_btn = searchForm.getElementsByTagName("button")[0];
const modal = document.getElementById("modal");
const btn_modal = document.getElementById("btn-modal");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // QUE LA PAGINA NO SE RECARGUE AL ENVIAR EL FORMULARIO
  getSummonerInfo();
});

// FUNCION QUE OBTIENE INFORMACION BASICA DEL JUGADOR (NOMBRE, NIVEL, SUMMONERID)
function getSummonerInfo() {
  const $region = searchForm.getElementsByTagName("select")[0];

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

  const url = `https://${$region.value}.api.riotgames.com/tft/summoner/v1/summoners/by-name/${summonerName.value}?api_key=${API_KEY}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status && data.status.status_code === 404) {
        // MOSTRAR MENSAJE EN CASO DE QUE EL JUGADOR NO EXISTA
        mostrarNotFound();
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
      mostrarNotFound();
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
  const $region = searchForm.getElementsByTagName("select")[0];

  const url = `https://${$region.value}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}?api_key=${API_KEY}`;
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
  const $region = searchForm.getElementsByTagName("select")[0];

  let continente;

  switch ($region.value) {
    case "LA1":
    case "LA2":
    case "NA1":
    case "BR1":
      continente = "americas";
      break;
    case "OC1":
      continente = "sea";
      break;
    case "SG2":
    case "TH2":
    case "TR1":
    case "JP1":
    case "VN1":
    case "TW2":
    case "PH2":
    case "KR":
      continente = "asia";
      break;
    case "EUN1":
    case "EUW1":
      continente = "europe";
      break;
  }

  fetch(
    `https://${continente}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`
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
  const $region = searchForm.getElementsByTagName("select")[0];

  let continente;

  switch ($region.value) {
    case "LA1":
    case "LA2":
    case "NA1":
    case "BR1":
      continente = "americas";
      break;
    case "OC1":
      continente = "sea";
      break;
    case "SG2":
    case "TH2":
    case "TR1":
    case "JP1":
    case "VN1":
    case "TW2":
    case "PH2":
    case "KR":
      continente = "asia";
      break;
    case "EUN1":
    case "EUW1":
      continente = "europe";
      break;
  }

  fetch(
    `https://${continente}.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${API_KEY}`
  )
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
    <img src="img/rangos/${rellenarImgRank(rank.tier, rank.rank)}" alt="${
    rank.tier
  } ${rank.rank}" title="${rank.tier} ${rank.rank}" class="img-rank"/>
    <p>${rank.tier} ${rank.rank}</p>
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

function mostrarNotFound() {
  modal.showModal();
  modal.classList.toggle("animado");
}

btn_modal.addEventListener("click", () => {
  modal.classList.toggle("animado");
  modal.close();
});

// Función que limpia la tabla
function clearTable() {
  const resultadoBody = document.getElementById("resultado-body");
  resultadoBody.innerHTML = "";
}
//--------------------------------

function rellenarImgRank(tier, rank) {
  //Objeto JSON que contiene los diferentes nombres de las imagenes por liga
  const ligas = {
    IRON: {
      IV: "Iron_4.jpg",
      III: "Iron_3.jpg",
      II: "Iron_2.jpg",
      I: "Iron_1.jpg",
    },
    BRONZE: {
      IV: "Bronze_4.jpg",
      III: "Bronze_3.jpg",
      II: "Bronze_2.jpg",
      I: "Bronze_1.jpg",
    },
    SILVER: {
      IV: "Silver_4.jpg",
      III: "Silver_3.jpg",
      II: "Silver_2.jpg",
      I: "Silver_1.jpg",
    },
    GOLD: {
      IV: "Gold_4.jpg",
      III: "Gold_3.jpg",
      II: "Gold_2.jpg",
      I: "Gold_1.jpg",
    },
    PLATINUM: {
      IV: "Platinum_4.jpg",
      III: "Platinum_3.jpg",
      II: "Platinum_2.jpg",
      I: "Platinum_1.jpg",
    },
    DIAMOND: {
      IV: "Diamond_4.jpg",
      III: "Diamond_3.jpg",
      II: "Diamond_2.jpg",
      I: "Diamond_1.jpg",
    },
    MASTER: {
      IV: "Master_4.jpg",
      III: "Master_3.jpg",
      II: "Master_2.jpg",
      I: "Master_1.jpg",
    },
    GRANDMASTER: {
      IV: "Grandmaster_4.jpg",
      III: "Grandmaster_3.jpg",
      II: "Grandmaster_2.jpg",
      I: "Grandmaster_1.jpg",
    },
    CHALLENGER: {
      IV: "Challenger_4.jpg",
      III: "Challenger_3.jpg",
      II: "Challenger_2.jpg",
      I: "Challenger_1.jpg",
    },
  };
  return ligas[tier][rank];
}

//asdasd
