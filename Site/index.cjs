const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const rdfstore = require('rdfstore');

const app = express()
const PORT = 8092;
const fs = require('fs')

module.exports = app;

app.use(require('body-parser').json());
app.use(express.static('public'));
app.use(cors());
app.use(helmet());

app.options('*', cors());

/*recup trajet gare arrive et depart*/
app.post('/trajet/gare/search', (request, response) =>
{
    console.log("Debut /trajet/gare/search");
    let gare_dep = request.body.garedep;
    let gare_arr = request.body.garearr;
    let resp = {};
    (async ()=>{
        try{
            const module = await import('./src/GenerateRdf.js');
            const rdfGare = await module.GenerateRdfDynamic("./src/Onthologies/Data/Gare/context.json","./src/Onthologies/Data/Gare/data.json");
            let store = new rdfstore.Store(function (err, store){
                store.load('text/n3', rdfGare, (s,d)=>{
                    console.log("S, D:", s,d);
                    store.execute(query_uicFromGare(gare_dep), function(err, res){
                        console.log(res)
                        if(res.length !== 0){
                            resp['garedep'] = res.value;
                        }else{
                            store.execute(query_uicFromGare(gare_dep.toUpperCase()), function(err, res) {
                                //console.log(res)
                                if(res.length !== 0) {
                                    resp['garedep'] = res.value;
                                }else{
                                    response.send({"success": false})
                                }
                            });
                        }
                    });

                    store.execute(query_uicFromGare(gare_arr), function(err, res){
                        console.log(res)
                        if(res.length !== 0){
                            resp['garearr'] = res.value;
                        }else{
                            response.send({"success":false})
                        }
                    });
                });
            });
        }catch (e) {
            console.log(e);
            response.send({"success":false})
        }
        console.log("== End async ==")
    })();
});

/* === Get journey of a train === */
app.post('/trajet/id', (request, response) =>
{
    console.log("Debut /trajet/id");
    saveJson("./src/Onthologies/Data/Train/trajet-data.json",(JSON.stringify(request.body.val)));
    let id = request.body.id;
    (async () =>{
        try {
            const module = await import('./src/GenerateRdf.js');
            const rdfTrajet = await module.GenerateRdfDynamic("./src/Onthologies/Data/Train/context.json","./src/Onthologies/Data/Train/trajet-data.json")
            //console.log(rdfTrajet)
            let store = new rdfstore.Store(function (err, store){
                store.load('text/n3', rdfTrajet, (s,d)=>{
                    store.execute(ASK_getJourney(id), function(err, res){
                        if (res.value == "yes"){
                            store.execute(getJourney(id),function (err,res) {
                                if(res && res.length !== 0){
                                    response.send({"success":true})
                                }else{
                                    response.send({"success":false})
                                }
                            });
                        }
                    });
                });
            });
        }
        catch (e){
            console.log(e);
            response.send({"success":false})
        }
    })();
});

/*== Get all station on start ==*/
app.post('/gare', (request, response) =>
{
    console.log("Debut /gare");
    (async () =>{
        try{
            const module = await import('./src/GenerateRdf.js');
            const rdfGare = await module.GenerateRdfDynamic("./src/Onthologies/Data/Gare/context.json","./src/Onthologies/Data/Gare/data.json");
            let store = new rdfstore.Store(function (err, store){
                store.load('text/n3', rdfGare, (s,d)=>{
                    store.execute(query_allGareName, function(err, res){
                        let val_ret = res.map(x=>x.name.value);
                        if(val_ret.length !==  0){
                            response.send({"All_Gare":val_ret,"success":true})
                        }else{
                            response.send({"success":false})
                        }
                    });
                });
            });
        }catch (e) {
            console.log(e);
            response.send({"success":false})
        }
    })();
});

app.get('/', (request, response) => {});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
console.log(`Open it with http://localhost:${PORT}`)

/* === Function === */

function saveJson(textName, jsonData) {
    fs.writeFile(textName, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

/* === Query === */
const query_allGareName = "SELECT ?name WHERE{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ?name}"

const query_uicFromGare = (gareName) =>{
    return `SELECT ?UIC WHERE`+
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "${gareName}"} UNION`+
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "${gareName}" }.`+
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7IDGare> ?UIC}`;
}

/* == Check if idtrain == value in RDF ==*/ //TrainName a changer
const ASK_getJourney = (idtrain) => {
    return `ASK {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Name> ${idtrain}}`
}

const getJourney = (idtrain) => {
    return `SELECT * WHERE {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Name> ${idtrain}}`
}

const get_coord = (gareName) => {
    return `SELECT ?cood WHERE`+
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ${gareName}} UNION`+
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> ${gareName} }.`+
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Coordinates> ?coord}`;
}