const fs = import('fs');
const fetch = import('node-fetch');

//const { data } = require('cheerio/lib/api/attributes');
const sncf_api_key = "6430b7e5-f72b-46a3-85f2-6920e725b010"
const sncf_weather_key = "6430b7e5-f72b-46a3-85f2-6920e725b010"

const findTrainJourney = module.exports.findTrainJourney = async id => {
    let today = new Date()
    let month = today.getMonth()+1
    let day = today.getDate();
    let date = today.getFullYear()+'-'+(month<10?'0'+month : month)+'-'+ (day < 10 ? '0'+day : day);
    console.log("Date : ", date)
    try {
        var response = await fetch(`https://${sncf_api_key}@api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:LongDistanceTrain`);
        var trains = await response.json();
        if(trains.hasOwnProperty("error")){
            response = await fetch(`https://${sncf_api_key}@api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:Train`);
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

const findTrainStation = module.exports.findTrainStation = async (departure, arrival) => {
    try {
        var response = await fetch(`https://${sncf_api_key}@api.sncf.com/v1/coverage/sncf/stop_points/stop_point:SNCF:${departure}:Train/departures`);
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

const findweather = module.exports.findweather = async (latitude, longitude) => {
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