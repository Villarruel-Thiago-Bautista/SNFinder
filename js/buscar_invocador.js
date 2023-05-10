//Constantes de elementos en pantalla
const summoner_input = document.getElementById("summoner_input");
const region_input = document.getElementById("region_input");
const summoner_display = document.getElementById("summoner_display");
const summoner_data = summoner_display.getElementsByTagName("ul")[0];
const summoner_image = summoner_display.getElementsByTagName("img")[0];
const summoner_display_history = document.getElementById("summoner_display_history");
const body_sdh = summoner_display_history.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0];
const search_btn = document.getElementById("search-btn");


//tabla de conversion de info de respuesta
const hashTable = {"RANKED_FLEX_SR":"Flex", "RANKED_SOLO_5x5":"Solo/Duo"};

const API_KEY = "RGAPI-ebbbca46-da57-4b11-9524-86e36c1eb3a8";

changeDisplay(summoner_display_history,"hidden");



//Disparador busqueda via enter

if(window.navigator.userAgent.match(/android|iphone|kindle|ipad/i)){
  
}
else{ 
  summoner_input.addEventListener("keydown", (event) => {
    if (event.isComposing || event.key === "Enter") {
      if (summoner_input.value != "") {
          summoner_input.disabled = true;
          search_btn.disabled = true;
          rellenarInfoSummoner();
          rellenarInfoPartidas();
      }
  
    }
  });  
}

//Disparador busqueda via boton
search_btn.addEventListener("click", (event) => {
  console.log("asd");
    if (summoner_input.value != "") {
        summoner_input.disabled = true;
        search_btn.disabled = true;
        rellenarInfoSummoner();
        rellenarInfoPartidas();
    }
});

//rellena informacion sobre el invocador en el div con id summoner_display
async function rellenarInfoSummoner(){
    let basicData = await basicInfoSummoner()
    let rankData = await summonerRank(basicData)
    await summonerImage(`https://ddragon.leagueoflegends.com/cdn/11.6.1/img/profileicon/${basicData.profileIconId}.png`);
    summoner_image.style.visibility = "initial"
    summoner_data.children[0].textContent = summoner_input.value;
    summoner_data.children[1].textContent = `Level: ${basicData.summonerLevel}`;
    let aux = 2;
    //Se usa la funcion aux como iterador para completar dinamicamente la info para la cantidad de colas que haya (De no haber, hay li vacios)
    for(let i = 0; i < rankData.length; i++){
      summoner_data.children[aux].textContent = `${hashTable[rankData[i].queueType]} = ${rankData[i].tier} ${rankData[i].rank} (${Math.trunc((rankData[i].wins)/(rankData[i].wins + rankData[i].losses)*100)}%) `;  
      aux++;
    }
    //Encargado de poner el winratio dependiendo de la cantidad de colas juegue la persona (De no jugar, li vacio) 
    if(rankData.length == 2){
      summoner_data.children[4].textContent = `Winratio ranked ${Math.trunc((rankData[0].wins + rankData[1].wins)/(rankData[0].wins + rankData[1].wins + rankData[0].losses + rankData[1].losses)*100)}%`; 
    }
    else if(rankData.length == 1){
      summoner_data.children[4].textContent = `Winratio ranked ${Math.trunc((rankData[0].wins)/(rankData[0].wins + rankData[0].losses)*100)}%`; 
    }
    }

//a futuro rellena informacion sobre las partidas dinamicamente en un table 
async function rellenarInfoPartidas(){

  let tbody = summoner_display_history.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0];

  //Preparaciones iniciales al HTML
  borrarHistorial();
  borrarInfoSummoner();
  changeDisplay(summoner_display_history,"hidden");
  //Pedidos de informacion
  let basicData = await basicInfoSummoner()
  let matchIdList = await matchIds(basicData.puuid);
  //For encargado de hacer el pedido de informacion y pintado de informacion dependiendo de i
  for(let i = 0; i < 5; i++){
    let match_data = await matchInfo(matchIdList[i]);
    let player_match_data = await player_matchData(match_data,basicData.puuid);
    let outcome = player_match_data.win ? "Victory" : "Defeat";
    tbody.appendChild(crearRegistro([player_match_data.championName,player_match_data.kills,player_match_data.deaths,player_match_data.assists,outcome]))
  } 
  //Vuelve a estar visible el historial, ya completo
  changeDisplay(summoner_display_history,"visible");
  search_btn.disabled = false;
  summoner_input.disabled = false;
}

//Funcion para pedir toda la info buscando el estandar DRY uwu
async function genericRequest(endpoint){
  try{
    let res = await fetch(endpoint);
    if(res.ok){
      let resJSON = await res.json();
      return resJSON;      
    }  
  }
  catch(e){
    return null;
  }
}

//retorna informacion auxiliar y nivel de invocador 
async function basicInfoSummoner() {
  let res = await genericRequest(`https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner_input.value}?api_key=${API_KEY}`);
  if(res != null){
    return res;
  }
  else{
    alert("No existe este invocador");
    console.log("404");
    search_btn.disabled = false;
    summoner_input.disabled = false;
  }
}
//retorna el rango del invocador (nada, soloq, flex, soloq y flex)
async function summonerRank(data) {
  let res = await genericRequest(`https://la2.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.id}?api_key=${API_KEY}`);
  return res;
}
//retorna lista de ID para usar en la funcion matchInfo
async function matchIds(puuid){
  let res = await genericRequest(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`);
  return res;
}
//retorna informacion de partida via id, se usa para mostrar modo de juego y ademas se usa en la funcion player_matchData
async function matchInfo(match_id){
  let res = await genericRequest(`https://americas.api.riotgames.com/lol/match/v5/matches/${match_id}?api_key=${API_KEY}`);
  return res;
}

async function summonerImage(url){
  summoner_image.src = "imagenes/amarillo.png"; 
  try{
    let res = await fetch(url);
    if(res.status == 200){
      summoner_image.src = url; 
    }  
  }
  catch(e){
    return null;
  }
}


//retorna informacion sobre el jugador en cuestion en la partida dada por matchData
function player_matchData(matchData,pid){
  for(let i = 0; i < 10; i++){
    if(matchData.info.participants[i].puuid == pid){
      return matchData.info.participants[i];
    }
  }
}

//Crea y retorna un elemento tr con la cantidad de sub-elementos td como informacion se necesite en la tabla
function crearRegistro(infoPartida){

  let tr = document.createElement("tr");

  for(let i = 0; i < infoPartida.length; i++){
    let td = document.createElement("td");
    tdText = document.createTextNode(infoPartida[i]);
    td.appendChild(tdText);
    tr.appendChild(td);
  }

  return tr;
}

function borrarHistorial(){
  summoner_display_history.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].innerHTML = "";
}

function borrarInfoSummoner(){
  summoner_image.src = "";
  summoner_data.children[0].textContent = "";
  summoner_data.children[1].textContent = ""; 
  summoner_data.children[2].textContent = ""; 
  summoner_data.children[3].textContent = "";
  summoner_data.children[4].textContent = "";
  summoner_display_history.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].innerHTML = "";
}

function changeDisplay(elemento,visibilidad){
  elemento.style.visibility = visibilidad;
}