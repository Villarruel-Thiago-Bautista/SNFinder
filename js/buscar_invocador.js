//Elementos que son escuchados por muchas funciones
const $summoner_display = document.getElementById("summoner_display");
const $summoner_data = $summoner_display.getElementsByTagName("ul")[0];
const $summoner_image = $summoner_display.getElementsByTagName("img")[0];
const $match_history = document.getElementById("summoner_display_history");
const $search_btn = document.getElementById("search-btn");

//Clave de la API
const API_KEY = "RGAPI-965b326c-2875-4684-a4d7-4945e813a64a";

changeDisplay($match_history, "hidden");

// 🔽🔽🔽 EVENT LISTENERS 🔽🔽🔽

//Elemento a escuchar
const $form = document.getElementById("formulario");
//Busqueda de invocador con region
$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if ($name_input.value != "") {
    rellenarFigureLiga("RANKED_FLEX_SR");
    rellenarFigureLiga("RANKED_SOLO_5X5");
    $name_input.disabled = true;
    $search_btn.disabled = true;

    let basicData = await basicInfoSummoner();
    rellenarInfoSummoner(basicData);
    rellenarInfoPartidas(basicData);
  }
});

//Elemento a escuchar
const $name_input = document.getElementById("summoner_input");
//Busqueda con enter solo en pc ejecutando el submit del formulario
if (window.navigator.userAgent.match(/android|iphone|kindle|ipad/i)) {
} else {
  $name_input.addEventListener("keydown", async (event) => {
    if (event.isComposing || event.key === "Enter") {
      if ($name_input.value != "") {
        $form.dispatchEvent(new Event("submit"));
      }
    }
  });
}

//Elemento a escuchar
const $btn_modal = document.getElementById("btn-modal");
//Desaparecer el modal de not found
$btn_modal.addEventListener("click", () => {
  const $modal = document.getElementById("modal");
  $modal.classList.toggle("animado");
  $modal.close();
});

// 🔼🔼🔼 EVENT LISTENERS 🔼🔼🔼

// 🔽🔽🔽 REQUESTS A LA API DE LOL 🔽🔽🔽

//Funcion para pedir toda la info buscando el estandar DRY uwu
async function genericRequest(endpoint) {
  try {
    let res = await fetch(endpoint);
    if (res.ok) {
      let resJSON = await res.json();
      return resJSON;
    }
  } catch (e) {
    return null;
  }
}

//retorna informacion auxiliar y nivel de invocador
async function basicInfoSummoner() {
  const $region = $form.getElementsByTagName("select")[0];

  let res = await genericRequest(
    `https://${$region.value}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${$name_input.value}?api_key=${API_KEY}`
  );
  if (res != null) {
    return res;
  } else {
    mostrarNotFound();
    console.log("404");
    $search_btn.disabled = false;
    $name_input.disabled = false;
  }
}
//retorna el rango del invocador (nada, soloq, flex, soloq y flex)
async function summonerRank(data) {
  const $region = $form.getElementsByTagName("select")[0];

  let res = await genericRequest(
    `https://${$region.value}.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.id}?api_key=${API_KEY}`
  );

  return res;
}
//retorna lista de ID para usar en la funcion matchInfo
async function matchIds(puuid) {
  /*
  RUSIA NO ANDA TAMPOCO EN OP GG

*/

  const $region = $form.getElementsByTagName("select")[0];
 
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
    case "RU":
      continente = "asia";
      break;
    case "EUN1":
    case "EUW1":
      continente = "europe";
      break;
  }

  let res = await genericRequest(
    `https://${continente}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`
  );

  return res;
}
//retorna informacion de partida via id, se usa para mostrar modo de juego y ademas se usa en la funcion player_matchData
async function matchInfo(match_id) {
  const $region = $form.getElementsByTagName("select")[0];

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

  let res = await genericRequest(
    `https://${continente}.api.riotgames.com/lol/match/v5/matches/${match_id}?api_key=${API_KEY}`
  );
  return res;
}

// 🔼🔼🔼 REQUESTS A LA API DE LOL 🔼🔼🔼

//rellena informacion sobre el invocador en el div con id summoner_display
async function rellenarInfoSummoner(basicData) {
  //Pedido de informacion relacionada con las partidas clasificatorias del jugador
  let rankData = await summonerRank(basicData);
  //Se agrega el icono del jugador
  $summoner_image.src = `https://ddragon.leagueoflegends.com/cdn/11.6.1/img/profileicon/${basicData.profileIconId}.png`;
  //Se hace visible la misma
  $summoner_image.style.visibility = "initial";
  //Se inserta el nombre del jugador
  $summoner_data.children[0].textContent = $name_input.value;
  //Se inserta el nivel del jugador con la informacion recibida en basicData
  $summoner_data.children[1].textContent = `Level: ${basicData.summonerLevel}`;
  //Dinamicamente se carga el contenido de los elementos figure con el rango y tier del jugador
  for (let i = 0; i < rankData.length; i++) {
    rellenarFigureLiga(rankData[i].queueType, rankData[i]);
  }
}

//Rellena informacion sobre las partidas dinamicamente en un table
async function rellenarInfoPartidas(basicData) {
  //Preparaciones iniciales al HTML
  borrarHistorial();
  borrarInfoSummoner();
  changeDisplay($match_history, "hidden");
  //Se piden los IDs de las ultimas 20 partidas jugadas por el jugador
  let matchIdList = await matchIds(basicData.puuid);
  //For encargado de hacer el pedido de informacion y pintado de informacion dependiendo de i
  if (matchIdList.length > 0) {
    for (let i = 0; i < 5; i++) {
      let match_data = await matchInfo(matchIdList[i]);
      let player_match_data = await player_matchData(
        match_data,
        basicData.puuid
      );

      $match_history.appendChild(
        await crearRegistro(match_data, player_match_data)
      );
    }
    //Vuelve a estar visible el historial, ya completo
    changeDisplay($match_history, "visible");
  }
  $search_btn.disabled = false;
  $name_input.disabled = false;
}

//retorna informacion sobre el jugador en cuestion en la partida dada por matchData
function player_matchData(matchData, pid) {
  try {
    for (let i = 0; i < 10; i++) {
      if (matchData.info.participants[i].puuid == pid) {
        return matchData.info.participants[i];
      }
    }
  } catch {
    $search_btn.disabled = false;
    $name_input.disabled = false;
  }
}

function rellenarFigureLiga(
  queue,
  infoCola = { tier: "", rank: "", losses: "", wins: "" }
) {

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
  //tabla de conversion de info de respuesta
  const hashTable = { RANKED_FLEX_SR: "Flex", RANKED_SOLO_5x5: "Solo/Duo" };
  //Variable usada para definir donde escribir
  let aux;
  //Eleccion del valor de aux
  queue == "RANKED_FLEX_SR" ? (aux = 1) : (aux = 0);
  //Se agrega contenido dinamicamente en el contenedor correspondiente dependiendo del valor de aux y si es un objeto NO vacio
  if (infoCola.tier == "") {
    document
      .getElementsByClassName("info-rango-container")
      [aux].getElementsByTagName("img")[0].src = "";
    document
      .getElementsByClassName("info-rango-container")
      [aux].getElementsByTagName("p")[0].textContent = "";
    document
      .getElementsByClassName("info-partidas-container")
      [aux].getElementsByTagName("p")[0].textContent = "";
    document
      .getElementsByClassName("info-partidas-container")
      [aux].getElementsByTagName("p")[1].textContent = "";
  } else {
    document
      .getElementsByClassName("info-rango-container")
      [aux].getElementsByTagName("img")[0].src = `img/rangos/${
      ligas[infoCola.tier][infoCola.rank]
    }`;
    document
      .getElementsByClassName("info-rango-container")
      [aux].getElementsByTagName(
        "p"
      )[0].textContent = `${infoCola.tier} ${infoCola.rank}`;
    document
      .getElementsByClassName("info-partidas-container")
      [aux].getElementsByTagName(
        "p"
      )[0].textContent = `${infoCola.wins}W - ${infoCola.losses}L`;
    document
      .getElementsByClassName("info-partidas-container")
      [aux].getElementsByTagName("p")[1].textContent = calcularWinratio(
      infoCola.wins,
      infoCola.losses
    );
  }
}

function calcularWinratio(wins, losses) {
  return `Winrate ${Math.trunc((wins / (wins + losses)) * 100)}%`;
}

//Crea y retorna un elemento tr con la cantidad de sub-elementos td como informacion se necesite en la tabla
async function crearRegistro(infoPartida, infoJugador) {
  const tablaHechizos = {
    1: "Cleanse",
    3: "Exhaust",
    4: "Flash",
    6: "Haste",
    7: "Heal",
    11: "Smite",
    12: "Teleport",
    13: "Mana",
    14: "Dot",
    21: "Barrier",
    30: "To the King!",
    31: "Poro Toss",
    32: "Snowball",
    33: "Nexus Siege: Siege Weapon Slot",
    34: "Nexus Siege: Siege Weapon Slot",
    35: "Nexus Siege: Siege Weapon Slot",
    36: "Nexus Siege: Siege Weapon Slot",
    39: "Ultra (Rapidly Flung) Mark",
    40: "Ultra (Rapidly Flung) Mark",
    41: "Ultra (Rapidly Flung) Mark",
    42: "Ultra (Rapidly Flung) Mark",
    43: "Ultra (Rapidly Flung) Mark",
    44: "Ultra (Rapidly Flung) Mark",
    45: "Ultra (Rapidly Flung) Mark",
    46: "Ultra (Rapidly Flung) Mark",
    47: "Ultra (Rapidly Flung) Mark",
    48: "Ultra (Rapidly Flung) Mark",
    49: "Ultra (Rapidly Flung) Mark",
    50: "Ultra (Rapidly Flung) Mark",
    51: "Ultra (Rapidly Flung) Mark",
    52: "Ultra (Rapidly Flung) Mark",
    53: "Ultra (Rapidly Flung) Mark",
    54: "Ultra (Rapidly Flung) Mark",
    55: "Ultra (Rapidly Flung) Mark",
    56: "Ultra (Rapidly Flung) Mark",
    57: "Ultra (Rapidly Flung) Mark",
    58: "Ultra (Rapidly Flung) Mark",
    59: "Ultra (Rapidly Flung) Mark",
    60: "Ultra (Rapidly Flung) Mark",
    61: "Ultra (Rapidly Flung) Mark",
    62: "Ultra (Rapidly Flung) Mark",
    63: "Ultra (Rapidly Flung) Mark",
    64: "Ultra (Rapidly Flung) Mark",
    65: "Ultra (Rapidly Flung) Mark",
    66: "Ultra (Rapidly Flung) Mark",
    67: "Ultra (Rapidly Flung) Mark",
    68: "Ultra (Rapidly Flung) Mark",
    69: "Ultra (Rapidly Flung) Mark",
    70: "Ultra (Rapidly Flung) Mark",
    71: "Ultra (Rapidly Flung) Mark",
    72: "Ultra (Rapidly Flung) Mark",
    73: "Ultra (Rapidly Flung) Mark",
  };

  //crea contenedor del registro
  let frag = document.createElement("div");
  frag.classList.add("registro-partida");
  //crea la columna de info general
  let infoGeneral = document.createElement("div");
  infoGeneral.classList.add("registro-partida-info-general");
  //crea elementos especificos que iran dentro de esta columna
  let modoDeJuego = document.createElement("p");
  modoDeJuego.textContent = infoPartida.info.gameMode;
  let duracion = document.createElement("p");
  duracion.textContent = `Duración: ${
    Math.trunc((infoPartida.info.gameDuration / 60) * 100) / 100
  }`;
  let resultado = document.createElement("p");
  resultado.textContent = infoJugador.win ? "Victoria" : "Derrota";
  //se insertan los elementos en la columna info general
  infoGeneral.appendChild(modoDeJuego);
  infoGeneral.appendChild(duracion);
  infoGeneral.appendChild(resultado);
  //se inserta la columna
  frag.appendChild(infoGeneral);
  //crea la columna de infoPersonaje
  let infoPersonaje = document.createElement("div");
  infoPersonaje.classList.add("registro-partida-info-personaje");
  infoPersonaje.classList.add("info-personaje");
  //crea los elementos especificos que iran dentro de esta columna
  let divPersonaje = document.createElement("div");
  divPersonaje.classList.add("texto-en-imagen");
  let personaje = document.createElement("img");
  personaje.classList.add("info-personaje-personaje");
  personaje.src = `https://ddragon.leagueoflegends.com/cdn/13.10.1/img/champion/${infoJugador.championName}.png`;
  personaje.alt = `Imagenn del personaje ${infoJugador.championName}`;
  personaje.title = `Imagenn del personaje ${infoJugador.championName}`;
  personaje.classList.add("imagen-campeon");
  let nivel = document.createElement("p");
  nivel.classList.add("nivel-personaje");
  if (infoJugador.champLevel > 10) {
    nivel.textContent = ` ${infoJugador.champLevel}`;
  } else {
    nivel.textContent = infoJugador.champLevel;
  }
  divPersonaje.appendChild(personaje);
  divPersonaje.appendChild(nivel);
  let contenedorHechizos = document.createElement("div");
  contenedorHechizos.classList.add("info-personaje-hechizos");
  let hechizo1 = document.createElement("img");
  hechizo1.src = `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/spell/Summoner${
    tablaHechizos[infoJugador.summoner1Id]
  }.png`;
  hechizo1.title = `Summoner${tablaHechizos[infoJugador.summoner1Id]}`;
  hechizo1.alt = `Summoner${tablaHechizos[infoJugador.summoner1Id]}`;
  let hechizo2 = document.createElement("img");
  hechizo2.src = `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/spell/Summoner${
    tablaHechizos[infoJugador.summoner2Id]
  }.png`;
  hechizo2.title = `Summoner${tablaHechizos[infoJugador.summoner2Id]}`;
  hechizo2.alt = `Summoner${tablaHechizos[infoJugador.summoner2Id]}`;
  contenedorHechizos.appendChild(hechizo1);
  contenedorHechizos.appendChild(hechizo2);
  //se crea div para contener los objetos usados por el jugador en esa partida
  let contenedorObjetos = document.createElement("div");
  contenedorObjetos.classList.add("info-personaje-items");
  //crea los elementos que iran dentro de esta columna
  let objeto0 = document.createElement("img");
  objeto0.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item0}.png`,infoJugador.item0
  );
  objeto0.alt = "";
  objeto0.title = "";
  objeto0.classList.add("img-info-personaje");
  objeto0.classList.add("item0");
  let objeto1 = document.createElement("img");
  objeto1.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item1}.png`,infoJugador.item1
  );
  objeto1.alt = "";
  objeto1.title = "";
  objeto1.classList.add("item1");
  objeto1.classList.add("img-info-personaje");
  let objeto2 = document.createElement("img");
  objeto2.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item2}.png`,infoJugador.item2
  );
  objeto2.alt = "";
  objeto2.title = "";
  objeto2.classList.add("item2");
  objeto2.classList.add("img-info-personaje");
  let objeto3 = document.createElement("img");
  objeto3.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item3}.png`,infoJugador.item3
  );
  objeto3.alt = "";
  objeto3.title = "";
  objeto3.classList.add("item3");
  objeto3.classList.add("img-info-personaje");
  let objeto4 = document.createElement("img");
  objeto4.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item4}.png`,infoJugador.item4
  );
  objeto4.alt = "";
  objeto4.title = "";
  objeto4.classList.add("item4");
  objeto4.classList.add("img-info-personaje");
  let objeto5 = document.createElement("img");
  objeto5.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item5}.png`,infoJugador.item5
  );
  objeto5.alt = "";
  objeto5.title = "";
  objeto5.classList.add("item5");
  objeto5.classList.add("img-info-personaje");

  contenedorObjetos.appendChild(objeto0);
  contenedorObjetos.appendChild(objeto1);
  contenedorObjetos.appendChild(objeto2);
  contenedorObjetos.appendChild(objeto3);
  contenedorObjetos.appendChild(objeto4);
  contenedorObjetos.appendChild(objeto5);

  let ward = document.createElement("img");
  ward.src = await verificarImagen(
    `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${infoJugador.item6}.png`,infoJugador.item6
  );
  ward.alt = "";
  ward.title = "";
  ward.classList.add("img-info-personaje");
  ward.classList.add("info-personaje-ward");

  infoPersonaje.appendChild(divPersonaje);
  infoPersonaje.appendChild(contenedorHechizos);
  infoPersonaje.appendChild(contenedorObjetos);
  infoPersonaje.appendChild(ward);

  frag.appendChild(infoPersonaje);

  //se cra columna resultados partida
  let infoResultados = document.createElement("div");
  infoResultados.classList.add("registro-partida-info-resultados");
  //se crean los elementos que iran dentro del mismo
  let k = infoJugador.kills;
  let d = infoJugador.deaths;
  let a = infoJugador.assists;
  let kda = document.createElement("p");
  kda.textContent = `KDA: ${k}/${d}/${a}`;
  let cs = document.createElement("p");
  let porcentajeParticipacionFarm = porcentajeFarmeo(infoPartida, infoJugador);
  cs.textContent = ` Cs: ${
    infoJugador.totalMinionsKilled + infoJugador.neutralMinionsKilled
  } (${porcentajeParticipacionFarm}%) `;
  let wardsPuestos = document.createElement("p");
  let porcentajeParticionWards = porcentajeWardeo(infoPartida, infoJugador);

  if (porcentajeParticionWards == "0") {
    wardsPuestos.textContent = `Wards: ---`;
  } else {
    wardsPuestos.textContent = `Wards: ${infoJugador.wardsPlaced} (${porcentajeParticionWards}%)`;
  }

  infoResultados.appendChild(kda);
  infoResultados.appendChild(cs);
  infoResultados.appendChild(wardsPuestos);

  frag.appendChild(infoResultados);

  return frag;
}

function borrarHistorial() {
  $match_history.innerHTML = "";
}

function borrarInfoSummoner() {
  $summoner_image.src = "";
  $summoner_data.children[0].textContent = "";
  $summoner_data.children[1].textContent = "";

  $match_history.innerHTML = "";
}

function changeDisplay(elemento, visibilidad) {
  elemento.style.visibility = visibilidad;
}

function mostrarNotFound() {
  const $modal = document.getElementById("modal");
  $modal.showModal();
  $modal.classList.toggle("animado");
}

function porcentajeWardeo(infoPartida, infoJugador) {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    if (infoPartida.info.participants[i].win == infoJugador.win) {
      total += infoPartida.info.participants[i].wardsPlaced;
    }
  }
  let porcentaje =
    Math.trunc(((infoJugador.wardsPlaced * 100) / total) * 100) / 100;

  if (Number.isNaN(porcentaje) == false) {
    return porcentaje;
  } else {
    return "0";
  }
}

function porcentajeFarmeo(infoPartida, infoJugador) {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    if (infoPartida.info.participants[i].win == infoJugador.win) {
      total +=
        infoPartida.info.participants[i].totalMinionsKilled +
        infoPartida.info.participants[i].neutralMinionsKilled;
    }
  }
  let porcentaje =
    Math.trunc(
      (infoJugador.totalMinionsKilled +
        (infoJugador.neutralMinionsKilled * 100) / total) *
        100
    ) / 100;

  if (Number.isNaN(porcentaje) == false) {
    return porcentaje;
  } else {
    return "0";
  }
}

function verificarImagen(url,item) {
  if(item == "0"){

    return "img/noitem.jpg";
  }
  return fetch(url)
    .then((response) => {
      if (response.status === 200) {
        return url; // La imagen está disponible
      } else {
        return Promise.reject(); // Rechazar la promesa para manejar el caso de error
      }
    })
    .catch(() => "img/noitem.jpg"); // Error al acceder a la URL de la imagen
}
