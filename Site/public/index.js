'use strict';

const btn_trajet = document.querySelector('#trajet-btn')
//const btn_gare = document.querySelector('#gare-btn')
const btn_train = document.querySelector('#train-btn')
const section_form = document.querySelector('#section_form')
const btn_send = document.querySelector('#btn_send')

function renderForm(type) {
    let txt = ''
    if(type == "train"){
        txt="<label for='id_train'><h3 style='padding-left: 2em'>N° de train</h3></label>"+
            "<div class=\"flex items-center p-6\">\n" +
            "   <input type=\"text\" id=\"id_train\" class=\"h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\" placeholder=\"Numero De Train\" required>\n" +
            "</div>\n"
        btn_send.value = "train";

    }else if(type == "trajet"){
        txt="<div class=\"items-center flex\" style='margin-bottom: 2em'>" +
            "   <label for='dep_station' class=\"w-96 px-3 leading-tight text-gray-700\">Gare de départ</label>" +
            "   <input type=\"text\" id=\"dep_station\" class=\"flex-auto h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\" placeholder=\"Gare de départ\" required>\n" +
            "</div>"+
            "<div class=\"items-center flex\" style='margin-bottom: 2em'>\n" +
            "   <label for='arr_station' class=\"w-96 px-3 leading-tight text-gray-700\">Gare d'arrivé</label>" +
            "   <input type=\"text\" id=\"arr_station\" class=\"flex-auto h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\" placeholder=\"Gare de d'arrivé\" required>\n" +
            "</div>\n"
        btn_send.value = "trajet";
    }
    section_form.innerHTML = txt;
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
        const gare_dep = document.querySelector('#dep_station').value
        const gare_arr = document.querySelector('#arr_station').value
        console.log(gare_dep,gare_arr)
        // Find stations UIC in the db with SPARQL
        uic_dep = "123456789"
        uic_arr = "123456789"
        var train_journey = findTrainStation(uic_dep, uic_arr)
        console.log(train_journey)
    }else if(btn_send.value == 'train'){
        const id_train = document.querySelector('#id_train').value
        var train_journey = findTrainJourney(id_train)
        console.log(train_journey)
    }
})

document.addEventListener('DOMContentLoaded', ()=>{
    renderForm('trajet')
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
        console.log(trains)
        return trains;
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
            return findTrainJourney(res[3]);
        }
        return trains;
    }catch (err) {
        console.log("Can't find the train", err)
        return {};
    }
}

const findweather = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://www.infoclimat.fr/public-api/gfs/json?_ll=${latitude},${longitude}${config.meteo}`
        );
        const data = await response.json();
        
        //Voir quel modif a faire (sur les noms des columns "2m" avec du regex)
        return data
    }catch (err) {
        console.log("Can't find the weather", err)
        return {};
    }
}
