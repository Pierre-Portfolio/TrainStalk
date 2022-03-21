//const api = require("./api.js")


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