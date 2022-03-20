const fetch = require('node-fetch');
const fs = import('fs');
//const { data } = require('cheerio/lib/api/attributes');
const api_key = "6430b7e5-f72b-46a3-85f2-6920e725b010"

const findTrainJourney = module.exports.findTrainJourney = async id => {
    let today = new Date()
    let month = today.getMonth()+1
    let day = today.getDate();
    let date = today.getFullYear()+'-'+(month<10?'0'+month : month)+'-'+ (day < 10 ? '0'+day : day);
    console.log("Date : ", date)
    try {
        var trains = await fetch(`https://${api_key}@api.sncf.com/v1/coverage/sncf/vehicle_journeys/vehicle_journey:SNCF:${date}:${id}:1187:LongDistanceTrain`)
        console.log("liste_train :",trains)
    }catch (err) {
        console.log("Can't find the train", err)
    }
}

findTrainJourney("9580")