//Elementos que son escuchados por muchas funciones
const $summoner_display = document.getElementById("summoner_display");
const $summoner_data = $summoner_display.getElementsByTagName("ul")[0];
const $summoner_image = $summoner_display.getElementsByTagName("img")[0];
const $match_history = document.getElementById("summoner_display_history");

//Clave de la API
const API_KEY = "RGAPI-05aaa489-8d00-4686-a863-5fb0481533f1";

changeDisplay($match_history, "hidden");


// 🔽🔽🔽 EVENT LISTENERS 🔽🔽🔽

//Elemento a escuchar
const $name_input = document.getElementById("summoner_input");
//Busqueda con enter solo en PC
if (window.navigator.userAgent.match(/android|iphone|kindle|ipad/i)) {
} else {
  $name_input.addEventListener("keydown", async (event) => {
    if (event.isComposing || event.key === "Enter") {
      if ($name_input.value != "") {

        rellenarFigureLiga("RANKED_FLEX_SR");
        rellenarFigureLiga("RANKED_SOLO_5X5");
        $name_input.disabled = true;
        $search_btn.disabled = true;

        let basicData = await basicInfoSummoner();
        rellenarInfoSummoner(basicData);
        rellenarInfoPartidas(basicData);
      }
    }
  });
}

//Elemento a escuchar
const $search_btn = document.getElementById("search-btn");
//Busqueda via click en boton
$search_btn.addEventListener("click", async (event) => {
  console.log(
    "Boca yo te amo, siempre te sigo a todos lados, De corazón, pongan más huevos, Porque a boca lo queremos, Este amor que por vos siento, Boca es un sentimiento, De corazón, pongan más huevos, Porque a boca lo queremos, Ver campeón, y River Plate, Vos ya sabés, este año vas para la B, Y river plate, vos ya sabés, Que vos vas a correr, Y dale dale dale vo, Dale dale dale dale vo, Boca, vamo que ganamo, Boca yo te amo, siempre te sigo a todos lados, De corazón, pongan más huevos, Porque a boca lo queremos, Este amor que por vos siento, Boca es un sentimiento, De corazón, pongan más huevos, Porque a boca, lo queremos ver campeón, Y river plate, vos ya sabés, este año vas para la B, Y river plate, vos ya sabés, que vos vas a correr, Y dale, dale, dale vo, Dale, dale, dale, dale vo, Boca, vamo que ganamo"
  );
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
const $btn_modal = document.getElementById("btn-modal");
//Desaparecer el modal de not found
$btn_modal.addEventListener("click",()=>{
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
  let res = await genericRequest(
    `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/${$name_input.value}?api_key=${API_KEY}`
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
  let res = await genericRequest(
    `https://la2.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.id}?api_key=${API_KEY}`
  );
  console.log(res);
  return res;
}
//retorna lista de ID para usar en la funcion matchInfo
async function matchIds(puuid) {
  let res = await genericRequest(
    `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`
  );
  return res;
}
//retorna informacion de partida via id, se usa para mostrar modo de juego y ademas se usa en la funcion player_matchData
async function matchInfo(match_id) {
  let res = await genericRequest(
    `https://americas.api.riotgames.com/lol/match/v5/matches/${match_id}?api_key=${API_KEY}`
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
  for(let i = 0; i < rankData.length; i++){
    rellenarFigureLiga(rankData[i].queueType,rankData[i]);
  }
}

//Rellena informacion sobre las partidas dinamicamente en un table
async function rellenarInfoPartidas(basicData) {
  let tbody = $match_history.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0];
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
      let outcome = player_match_data.win ? "Victory" : "Defeat";
      tbody.appendChild(
        crearRegistro([
          player_match_data.championName,
          player_match_data.kills,
          player_match_data.deaths,
          player_match_data.assists,
          outcome,
        ])
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
  for (let i = 0; i < 10; i++) {
    if (matchData.info.participants[i].puuid == pid) {
      return matchData.info.participants[i];
    }
  }
}


function rellenarFigureLiga(queue,infoCola = {tier : "", rank: "", losses: "", wins: ""}){
  console.log(infoCola);
  //Objeto JSON que contiene los diferentes nombres de las imagenes por liga
  const ligas = {
    "IRON": {
      "IV": "Iron_4.jpg",
      "III": "Iron_3.jpg",
      "II": "Iron_2.jpg",
      "I": "Iron_1.jpg",
    },
    "BRONZE": {
      "IV": "Bronze_4.jpg",
      "III": "Bronze_3.jpg",
      "II": "Bronze_2.jpg",
      "I": "Bronze_1.jpg",
    },
    "SILVER": {
      "IV": "Silver_4.jpg",
      "III": "Silver_3.jpg",
      "II": "Silver_2.jpg",
      "I": "Silver_1.jpg",
    },
    "GOLD": {
      "IV": "Gold_4.jpg",
      "III": "Gold_3.jpg",
      "II": "Gold_2.jpg",
      "I": "Gold_1.jpg",
    },
    "PLATINUM": {
      "IV": "Platinum_4.jpg",
      "III": "Platinum_3.jpg",
      "II": "Platinum_2.jpg",
      "I": "Platinum_1.jpg",
    },
    "DIAMOND": {
      "IV": "Diamond_4.jpg",
      "III": "Diamond_3.jpg",
      "II": "Diamond_2.jpg",
      "I": "Diamond_1.jpg",
    },
    "MASTER": {
      "IV": "Master_4.jpg",
      "III": "Master_3.jpg",
      "II": "Master_2.jpg",
      "I": "Master_1.jpg",
    },
    "GRANDMASTER": {
      "IV": "Grandmaster_4.jpg",
      "III": "Grandmaster_3.jpg",
      "II": "Grandmaster_2.jpg",
      "I": "Grandmaster_1.jpg",
    },
    "CHALLENGER": {
      "IV": "Challenger_4.jpg",
      "III": "Challenger_3.jpg",
      "II": "Challenger_2.jpg",
      "I": "Challenger_1.jpg",
    },
  }
  //tabla de conversion de info de respuesta
  const hashTable = { RANKED_FLEX_SR: "Flex", RANKED_SOLO_5x5: "Solo/Duo" }; 
  //Variable usada para definir donde escribir
  let aux;
  //Eleccion del valor de aux
  queue == "RANKED_FLEX_SR" ? aux = 1 : aux = 0;
  //Se agrega contenido dinamicamente en el contenedor correspondiente dependiendo del valor de aux y si es un objeto NO vacio
  if(infoCola.tier == ""){
    document.getElementsByClassName("info-rango-container")[aux].getElementsByTagName("img")[0].src = "";
    document.getElementsByClassName("info-rango-container")[aux].getElementsByTagName("p")[0].textContent = "";
    document.getElementsByClassName("info-partidas-container")[aux].getElementsByTagName("p")[0].textContent = "";
    document.getElementsByClassName("info-partidas-container")[aux].getElementsByTagName("p")[1].textContent = "";  
  }
  else{
    document.getElementsByClassName("info-rango-container")[aux].getElementsByTagName("img")[0].src = `img/rangos/${ligas[infoCola.tier][infoCola.rank]}`;
    document.getElementsByClassName("info-rango-container")[aux].getElementsByTagName("p")[0].textContent = `${infoCola.tier} ${infoCola.rank}`;
    document.getElementsByClassName("info-partidas-container")[aux].getElementsByTagName("p")[0].textContent = `${infoCola.wins}W - ${infoCola.losses}L`;
    document.getElementsByClassName("info-partidas-container")[aux].getElementsByTagName("p")[1].textContent = calcularWinratio(infoCola.wins,infoCola.losses);
  
  }
}

function calcularWinratio(wins,losses){
  return `Winrate ${Math.trunc((wins / (wins + losses)) * 100)}%`;
}


//Crea y retorna un elemento tr con la cantidad de sub-elementos td como informacion se necesite en la tabla
function crearRegistro(infoPartida) {
  let tr = document.createElement("tr");

  for (let i = 0; i < infoPartida.length; i++) {
    let td = document.createElement("td");
    if(i == 0){
      let imagen = document.createElement("img");
      imagen.src = `http://ddragon.leagueoflegends.com/cdn/13.10.1/img/champion/${infoPartida[0]}.png`;
      imagen.alt = `Imagenn del personaje ${infoPartida[0]}`;
      imagen.title = infoPartida[0];
      imagen.classList.add("imagen-campeon");
      td.appendChild(imagen);
    }
    else{
      tdText = document.createTextNode(infoPartida[i]);
      td.appendChild(tdText);
    }
    tr.appendChild(td);
  }

  return tr;
}

function borrarHistorial() {
  $match_history
    .getElementsByTagName("table")[0]
    .getElementsByTagName("tbody")[0].innerHTML = "";
}

function borrarInfoSummoner() {
  $summoner_image.src = "";
  $summoner_data.children[0].textContent = "";
  $summoner_data.children[1].textContent = "";

  $match_history
    .getElementsByTagName("table")[0]
    .getElementsByTagName("tbody")[0].innerHTML = "";
}

function changeDisplay(elemento, visibilidad) {
  elemento.style.visibility = visibilidad;
}


function mostrarNotFound(){
  const $modal = document.getElementById("modal");
  $modal.showModal();
  $modal.classList.toggle("animado");
};
