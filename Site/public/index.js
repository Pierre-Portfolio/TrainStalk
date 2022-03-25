'use strict';

const btn_trajet = document.querySelector('#trajet-btn');
//const btn_gare = document.querySelector('#gare-btn');
const btn_train = document.querySelector('#train-btn');
const section_form = document.querySelector('#section_form');
const btn_send = document.querySelector('#btn_send');

let inpuGareDepart = null;
let inpuGareArrive = null;
let loading = true;

console.log(inpuGareDepart)
let all_Gare = [];
function renderForm(type) {
    let txt = ''
    if(type == "train"){
        txt = "<div class=\"flex items-center justify-between p-6\">\n" +
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
    inpuGareDepart = document.querySelector('#dep_station');
    inpuGareArrive = document.querySelector('#arr_station');

    if (loading) {
        inpuGareDepart.addEventListener('keyup', (event) => {
            let parent =  document.getElementById("data1")
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }

            let ListGare = all_Gare.filter(element => element.includes(inpuGareDepart.value))
            for (let j = 0; j < 5; j++) {
                let res = ListGare[j]
                var option = document.createElement('option');
                option.value = res;
                parent.appendChild(option);  
            }
        })

        inpuGareArrive.addEventListener('keyup', (event) => {
            let parent = document.getElementById("data2")
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }

            let ListGare = all_Gare.filter(element => element.includes(inpuGareDepart.value))
            for (let j = 0; j < 5; j++) {
                let res = ListGare[j]
                var option = document.createElement('option');
                option.value = res;
                parent.appendChild(option);  
            }
        })
    }
    loading = false;
}

btn_trajet.addEventListener('click', ()=>{
    renderForm("trajet")
})
/*
btn_gare.addEventListener('click', ()=>{
    console.log("Btn gare click")
})
*/
btn_train.addEventListener('click', ()=>{
    renderForm("train")
})

btn_send.addEventListener('click', async () =>{
    if(btn_send.value == 'trajet'){
        const gare_dep = document.querySelector('#dep_station').value;
        const gare_arr = document.querySelector('#arr_station').value;

        let jsonSend_gare = {"garedep":gare_dep, "garearr":gare_arr};
        let uic = await sendJson("/trajet/gare/search", jsonSend_gare);
        console.log(uic)
        /*
        if(uic !== null){
            let train_journey_send = findTrainStation(uic.uic_dep, uic.uic_arr);
            let rep = await sendJson(`/trajet/id`, train_journey_send)
            if(rep !== {}){
                console.log(rep)
            }else{

            }
        }else {

        }
        */
    }else if(btn_send.value == 'train'){
        const id_train = document.querySelector('#id_train').value
        let train_journey_json = await findTrainJourney(id_train)
        let jsonSend = {id:id_train, val : train_journey_json};
        let rep = await sendJson(`/trajet/id`, jsonSend)
    }
})

document.addEventListener('DOMContentLoaded', async ()=>{
    renderForm('trajet')
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
    console.log("Date : ", date)
    try {
        let url = `https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:LongDistanceTrain`
        var response = await fetch(url, options_fetch)
        var trains = await response.json();
        if(trains.hasOwnProperty("error")){
            response = await fetch(`https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:Train`, options_fetch);
            trains = await response.json();
            if(trains.hasOwnProperty("error")){
                trains = {};
            }
        }

        trains = trains['vehicle_journeys']
        trains[0]['size'] = trains[0]['id'].split(':')[5]
        delete trains[0]['journey_pattern']
        delete trains[0]['headsign']
        delete trains[0]['trip']
        return trains[0];
    }catch (err) {
        console.log("Can't find the train", err)
        return {};
    }
}

const findTrainStation = async (departure, arrival) => {
    try {
        var response = await fetch(`https://api.sncf.com/v1/coverage/sncf/stop_points/stop_point:SNCF:${departure}:Train/departures`, options_fetch);
        var trains = await response.json();
        if(trains.hasOwnProperty("error")){
            trains = {};
        }
        else{
            var res = trains["departures"].filter(dep=>dep["route"]["direction"]["stop_area"]["codes"][1]["value"] === arrival)
            res = res[0]["links"].filter(lk=>lk["type"] === "vehicle_journey");
            res = res[0]["id"];
            res = res.split(':');
            return {"id":res[3],"val":findTrainJourney(res[3])};
        }
        
        trains = trains['vehicle_journeys']
        trains[0]['size'] = trains[0]['id'].split(':')[5]
        delete trains[0]['journey_pattern']
        delete trains[0]['headsign']
        delete trains[0]['trip']
        return trains[0];
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