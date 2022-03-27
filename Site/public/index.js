'use strict';

const btn_trajet = document.querySelector('#trajet-btn');
const btn_train = document.querySelector('#train-btn');
const section_form = document.querySelector('#section_form');
const btn_send = document.querySelector('#btn_send');
const next_train = document.querySelector('#next_train');
const previous_train = document.querySelector('#previous_train');

let inpuGareDepart = null;
let inpuGareArrive = null;

let all_Gare = [];
let currentJourney = null;
let currentJourneyPosition = 0;
let currentStation = null;
let currentMeteo = null;

function renderForm(type) {
    let txterror = `<div id="AlertError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative hidden" role="alert">
            <strong class="font-bold" > Une Erreur est survenue ! </strong >
                <span class="block sm:inline">Veulliez remplir le formulaire</span>
                <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                </span>
            </div >`
    let txt = ''
    if(type == "train"){
        txt = txterror + "<div class=\"flex items-center justify-between p-6\">\n" +
            "<label for='id_train'><h3>N° de train</h3></label><input type=\"text\" id=\"id_train\" class=\"h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\" placeholder=\"Numero De Train\" required>\n" +
            "</div>\n"
        btn_send.value = "train";
    }else if(type == "trajet"){
        txt="<div class=\"items-center flex\" style='margin-bottom: 2em'>" +
            "   <label for='dep_station' class=\"w-96 px-3 leading-tight text-gray-700\">Gare de départ</label>" +
            "   <input list=\"data1\" id=\"dep_station\" class=\"flex-auto h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\" placeholder=\"Gare de départ\" required>\n" +
            "<datalist id=\"data1\"></div></div>"+
            "<div class=\"items-center flex\" style='margin-bottom: 2em'>\n" +
            "   <label for='arr_station' class=\"w-96 px-3 leading-tight text-gray-700\">Gare d'arrivé</label>" +
            "   <input list=\"data2\" type=\"text\" id=\"arr_station\" class=\"flex-auto h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\" placeholder=\"Gare de d'arrivé\" required>\n" +
            "<datalist id=\"data2\"></div></div>\n"
        btn_send.value = "trajet";
    }
    section_form.innerHTML = txt;

    if (type == "trajet") {
        inpuGareDepart = document.querySelector('#dep_station');
        inpuGareArrive = document.querySelector('#arr_station');

        inpuGareDepart.addEventListener('keyup', (event) => {
            let parent =  document.getElementById("data1")
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
            console.log("Saisie Utilisateur")
            let ListGare = all_Gare.filter(element => element.includes(inpuGareDepart.value))
            for (let j = 0; j < 5; j++) {
                let res = ListGare[j]
                var option = document.createElement('option');
                option.value = res;

                var attr = document.createAttribute("property");
                attr.value = "station:NomGare";
                option.setAttributeNode(attr);
                
                parent.appendChild(option);  
            }        
        })

        inpuGareArrive.addEventListener('keyup', (event) => {
            let parent = document.getElementById("data2")
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
            console.log("Saisie Utilisateur")
            let ListGare = all_Gare.filter(element => element.includes(inpuGareArrive.value))
            for (let j = 0; j < 5; j++) {
                let res = ListGare[j]
                var option = document.createElement('option');
                option.value = res;

                var attr = document.createAttribute("property");
                attr.value = "Station:NomGare";
                option.setAttributeNode(attr);

                parent.appendChild(option);  
            }
        })
    }
}

async function renderDisplayJourney(){
    console.log(currentStation)
    if(currentStation == null){
        let txt = `Aucun Résultat Trouvé`
        document.querySelector('#section_show').innerHTML = txt;
    }else{
        let heureA = currentStation["arrival "].slice(0, 2) + ' : ' + currentStation["arrival "].slice(2, 4) + ' : ' + currentStation["arrival "].slice(4, 6)
        let heureD = currentStation["departure "].slice(0, 2) + ' : ' + currentStation["departure "].slice(2, 4) + ' : ' + currentStation["departure "].slice(4, 6)
        let sizeT = currentStation['size'].match(/[A-Z][a-z]+/g);
        if (sizeT.length == 3){
            sizeT = sizeT[2] + " " + sizeT[0] + " " + sizeT[1]
        }
        else {
            sizeT = currentStation['size']
        }
        console.log(currentMeteo)
        let txt = `<label><i class="fa-solid fa-place-of-worship"></i> Nom de station : <a id="GareDT" property="station:NomGare"> ${currentStation['station_name ']} </a></label>
                   <label><i class="fa-solid fa-hourglass-start"></i> Heure Départ : <a id="HeureDT" property="hour:Hours"> ${heureA} </a></label>
                   <label><i class="fa-solid fa-hourglass-end"></i> Heure Arrivé : <a id="NameART" property="hour:Hours"> ${heureD} </a></label>
                   <label><i class="fa-solid fa-vector-square"></i> Size : <a id="TypeT" property="train:Size"> ${sizeT} </a></label>
                   <label><i class="fa-solid fa-temperature-half"></i> Temperature : <a id="Temperature" property="weather:Temperature"> ${currentMeteo.tempValue} </a> Kelvin</label>
                   <label><i class="fa-solid fa-wind"></i> Vent : <a id="Vent" property="weather:Wind"> ${currentMeteo.wind} </a> km/h</label>
                   <label><i class="fa-solid fa-cloud-rain"></i> Pluie : <a id="Pluie" property="weather:Rain"> ${currentMeteo.rain} </a> mm</label>`

        document.querySelector('#section_show').innerHTML = txt;
    }
}

btn_trajet.addEventListener('click', ()=>{
    renderForm("trajet")
})

next_train.addEventListener('click', async ()=>{
    if (currentJourneyPosition >= currentJourney.length-1){
        currentJourneyPosition = 0;
    }else{
        currentJourneyPosition +=1
    }
    currentStation = currentJourney[currentJourneyPosition];
    await getMeto();
    renderDisplayJourney();
})

previous_train.addEventListener('click', async ()=>{
    if (currentJourneyPosition <= 0){
        currentJourneyPosition = currentJourney.length-1;
    }else{
        currentJourneyPosition -=1
    }
    currentStation = currentJourney[currentJourneyPosition];
    await getMeto();
    renderDisplayJourney();
})

btn_train.addEventListener('click', ()=>{
    renderForm("train")
})

btn_send.addEventListener('click', async () =>{
    if(btn_send.value == 'trajet'){
        const gare_dep = document.querySelector('#dep_station').value;
        const gare_arr = document.querySelector('#arr_station').value;

        let jsonSend_gare = {"garedep":gare_dep, "garearr":gare_arr};
        let uic = await sendJson("/trajet/gare/search", jsonSend_gare);
        if(uic !== null && uic.success == true){
            let id_gare = uic.uic
            let train_journey_send = await findTrainStation(id_gare.garedep, id_gare.garearr);

            if(Object.keys(train_journey_send).length !== 0){
                let rep = await sendJson(`/trajet/id`, train_journey_send);
                currentJourney = rep.values;
                try {
                    currentStation = currentJourney[0]
                } catch (error) {
                    currentJourney = null;
                }
            }else{
                console.log("Not found");
                currentJourney = null;
                currentStation = null;
            }
        }else {
            currentJourney = null;
            currentStation = null;
        }
    }else if(btn_send.value == 'train'){
        const id_train = document.querySelector('#id_train').value
        if (id_train == "")
        {
            document.getElementById("AlertError").classList.add("show");
            document.getElementById("AlertError").classList.remove("hidden");
        }
        else
        {
            document.getElementById("AlertError").classList.remove("show");
            document.getElementById("AlertError").classList.add("hidden");

            let train_journey_json = await findTrainJourney(id_train)
            let jsonSend = { id: id_train, val: train_journey_json };
            let rep = await sendJson(`/trajet/id`, jsonSend)
            currentJourney = rep.values;
            try {
                currentStation = currentJourney[0]
            } catch (error) {
                currentJourney = null;
            }
            document.getElementById("res_hidden").classList.remove("hidden");
        }
    }
    await getMeto()
    renderDisplayJourney();
})

document.addEventListener('DOMContentLoaded', async ()=>{
    renderForm('trajet');
    renderDisplayJourney();

    all_Gare = await getGare();
    all_Gare = all_Gare['All_Gare'];
})

// Requests for API
const sncf_api_key = "6430b7e5-f72b-46a3-85f2-6920e725b010"
const sncf_weather_key = "6430b7e5-f72b-46a3-85f2-6920e725b010"
const options_fetch = {
    headers:{
    "Authorization": "6430b7e5-f72b-46a3-85f2-6920e725b010"
  }
}

const findTrainJourney = async id => {
    let today = new Date()
    let month = today.getMonth()+1
    let day = today.getDate();
    let date = today.getFullYear()+'-'+(month<10?'0'+month : month)+'-'+ (day < 10 ? '0'+day : day);
    try {
        let url = `https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:LongDistanceTrain`
        var response = await fetch(url, options_fetch)
        var trains = await response.json();
        console.log(trains)
        if(trains.hasOwnProperty("error")){
            response = await fetch(`https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:Train`, options_fetch);
            trains = await response.json();
            if(trains.hasOwnProperty("error")){
                trains = {};
            }
        }

        trains = trains['vehicle_journeys'];
        trains[0]['size'] = trains[0]['id'].split(':')[5];
        trains[0].train_id = trains[0].name;
        delete trains[0].name;
        delete trains[0]['journey_pattern'];
        delete trains[0]['headsign'];
        delete trains[0]['trip'];



        return trains[0];
    }catch (err) {
        console.log("Can't find the train", err)
        return {};
    }
}

const findTrainStation = async (departure, arrival) => {
    try {
        let response = await fetch(`https://api.sncf.com/v1/coverage/sncf/stop_points/stop_point:SNCF:87317362:Train/departures`, options_fetch);
        let trains = await response.json();
        if(!trains.hasOwnProperty("error")) {
            let res = trains.departures;
            res = res.filter(dep => dep["route"]["direction"]["stop_area"]["codes"][1]["value"].includes(arrival));
            if (res.length != 0) {
                res = res[0]["links"].filter(lk=>lk["type"] === "vehicle_journey");
                res = res[0]["id"];
                res = res.split(':');
                let journey = await findTrainJourney(res[3]);
                return {"id": res[3], "val": journey};
            }
        }
        return {};
    }catch (err) {
        console.log("Can't find the train", err)
        return {};
    }
}

const findweather = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://www.infoclimat.fr/public-api/gfs/json?_ll=${latitude},${longitude}&_auth=BhxSRQF%2FVXcFKAE2DnhXfgBoDjtbLQUiUCwKaVw5Uy4EbwRlBmYAZgdpVSgDLFBmU34BYg02UmIBalUtCnhTMgZsUj4BalUyBWoBZA4hV3wALg5vW3sFIlAyCmpcN1MuBGYEZAZiAHwHalU3AztQelNnAWMNLVJ1AWNVNApmUzgGZlI0AWtVMAVoAWYOIVd8ADUObltjBThQYAptXDZTZAQzBDEGMwBnB21VNgMtUGNTaQFkDTVSbQFgVTQKb1MvBnpSTwERVSoFKgEhDmtXJQAuDjtbOgVp&_c=3523bcf3629d763891b8d24665da6a4c`
        );
        let data = await response.json();
        let myJson = JSON.stringify(data);
        myJson = myJson.replaceAll('re":{"2m', 're":{"temperature_2m')
        myJson = myJson.replaceAll('te":{"2m', 'te":{"humidite_2m')

        myJson = myJson.replaceAll('en":{"10m', 'en":{"vent_moyen_10m')
        myJson = myJson.replaceAll('es":{"10m', 'es":{"vent_rafales_10m')
        myJson = myJson.replaceAll('on":{"10m', 'on":{"vent_direction_10m')

        const regexp = RegExp('2022.+?(?=")', 'g');
        let matches = myJson.matchAll(regexp);
        
        let i = 0
        for (const match of matches) {
            myJson = myJson.replaceAll(match[0], "col" + i)
            i = i + 1;
        }
        data = JSON.parse(myJson);
        return data
    }catch (err) {
        console.log("Can't find the weather", err)
        return {};
    }
}

const sendJson = async (url, jsonData) => {
    const rep = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    });
    const content =  await rep.json();
    console.log(content);
    return content
}

const getGare = async() =>{
    const rep = await fetch("/gare", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const content =  await rep.json();
    return content
}

const getMeto = async () =>{
    let weatherdata = await findweather(currentStation["lat"], currentStation["long"])
    currentMeteo = await sendJson("/meteo",weatherdata);
    currentMeteo = currentMeteo.weather
}