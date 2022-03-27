const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const rdfstore = require('rdfstore');
const {GenerateRdfDynamic, GenerateRdfDynamicWithoutUrl} = require('./src/GenerateRdf.js');

const app = express()
const PORT = 8092;
const fs = require('fs')

app.use(require('body-parser').json());
app.use(express.static('public'));
app.use(cors());
app.use(helmet());

app.options('*', cors());

/*recup trajet gare arrive et depart*/
app.post('/meteo', async (request, response) => {
    console.log("Debut /meteo");
    const rdfWeather = await GenerateRdfDynamicWithoutUrl("./src/Onthologies/Data/Weather/context.json", request.body);
    let store = new rdfstore.Store((err, store) => {
        store.load('text/n3', rdfWeather, (s, d) => {
            store.execute(get_weather(), (err, res) => {
                console.log("Vide ?")
                if (res.length !== 0) {
                    console.log(res)
                }
            });
        });
    });
})

/*recup trajet gare arrive et depart*/
app.post('/trajet/gare/search', async (request, response) => {
    console.log("Debut /trajet/gare/search");
    let gare_dep = request.body.garedep;
    let gare_arr = request.body.garearr;
    let resp = {};
    try {
        const rdfGare = await GenerateRdfDynamic("./src/Onthologies/Data/Gare/context.json", "./src/Onthologies/Data/Gare/data.json");
        let store = new rdfstore.Store((err, store) => {
            store.load('text/n3', rdfGare, (s, d) => {
                store.execute(query_uicFromGare(gare_dep), (err, res) => {
                    if (res.length !== 0) {
                        resp['garedep'] = res[0].UIC.value;
                        store.execute(query_uicFromGare(gare_arr), (err, res) => {
                            if (res.length !== 0) {
                                resp['garearr'] = res[0].UIC.value;
                                response.send({
                                    "uic": resp,
                                    "success": true
                                })
                            } else {
                                store.execute(query_uicFromGare(gare_arr.toUpperCase()), (err, res) => {
                                    if (res.length !== 0) {
                                        resp['garearr'] = res[0].UIC.value;
                                        response.send({
                                            "uic": resp,
                                            "success": true
                                        })
                                    } else {
                                        response.send({
                                            "success": false
                                        })
                                    }
                                });
                            }
                        });
                    } else {
                        store.execute(query_uicFromGare(gare_dep.toUpperCase()), (err, res) => {
                            if (res.length !== 0) {
                                resp['garedep'] = res[0].UIC.value;
                                store.execute(query_uicFromGare(gare_arr), (err, res) => {
                                    if (res.length !== 0) {
                                        resp['garearr'] = res[0].UIC.value;
                                        response.send({
                                            "uic": resp,
                                            "success": true
                                        })
                                    } else {
                                        store.execute(query_uicFromGare(gare_arr.toUpperCase()), (err, res) => {
                                            if (res.length !== 0) {
                                                resp['garearr'] = res[0].UIC.value;
                                                response.send({
                                                    "uic": resp,
                                                    "success": true
                                                })
                                            } else {
                                                response.send({
                                                    "success": false
                                                })
                                            }
                                        });
                                    }
                                });
                            } else {
                                response.send({
                                    "success": false
                                })
                            }
                        });
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
        response.send({
            "success": false
        })
    }
});

/* === Get journey of a train === */
app.post('/trajet/id', async (request, response) => {
    console.log("Debut /trajet/id");
    let id = request.body.id;
    try {
        const rdfTrajet = await GenerateRdfDynamicWithoutUrl("./src/Onthologies/Data/Train/context.json", request.body.val);
        let store = new rdfstore.Store(function (err, store) {
            store.load('text/n3', rdfTrajet, (s, d) => {
                store.execute(ASK_getJourney(id), function (err, res) {
                    if (res === true) {
                        store.execute(getJourney(id), function (err, res) {
                            if (res && res.length !== 0) {
                                let val_res = res.map(x => {
                                    return {
                                        "station_name ": x.stop_name.value,
                                        "arrival ": x.arrival.value,
                                        "departure ": x.depart.value,
                                        "lat": x.lat.value,
                                        "long": x.long.value,
                                        "size": x.size.value
                                    }
                                });
                                response.send({
                                    "values": val_res,
                                    "success": true
                                })
                            } else {
                                response.send({
                                    "success": false
                                })
                            }
                        });
                    } else {
                        response.send({
                            "success": false
                        })
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
        response.send({
            "success": false
        })
    }
});

/*== Get all station on start ==*/
app.post('/gare', async (request, response) => {
    try {
        const rdfGare = fs.readFileSync('./src/Onthologies/Data/Gare/gare-data.nq').toString();
        let store = new rdfstore.Store(function (err, store) {
            store.load('text/n3', rdfGare, (s, d) => {
                store.execute(query_allGareName, function (err, res) {
                    let val_ret = res.map(x => x.name.value);
                    if (val_ret.length !== 0) {
                        response.send({
                            "All_Gare": val_ret,
                            "success": true
                        })
                    } else {
                        response.send({
                            "success": false
                        })
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
        response.send({
            "success": false
        })
    }
    console.log("Liste des gares : Done...");
});

app.get('/', (request, response) => {});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
console.log(`Open it with http://localhost:${PORT}`)

/* === Function === */

function saveJson(textName, jsonData) {
    fs.writeFile(textName, jsonData, function (err) {
        if (err) {
            console.log(err);
        }
    });
}

/* === Query === */
const query_allGareName = "SELECT ?name WHERE{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ?name}"

const query_uicFromGare = (gareName) => {
    return `SELECT ?UIC WHERE` +
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "${gareName}"} UNION` +
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "${gareName}" }.` +
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7IDGare> ?UIC}`;
}

/* == Check if idtrain == value in RDF ==*/ //TrainName a changer
const ASK_getJourney = (idtrain) => {
    return `ASK {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7train_id> "${idtrain}"}`
}

const getJourney = (idtrain) => {
    return `SELECT ?arrival ?depart ?stop_name ?lat ?long ?size WHERE {
?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7train_id> "${idtrain}".
?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_times> ?y.
?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Arrive> ?arrival.
?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Depart> ?depart.
?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_point> ?z.
?z <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Name> ?stop_name.
?z <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7coord> ?a.
?a <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7TrainLatitude> ?lat.
?a <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7TrainLongitude> ?long .
?c <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Size> ?size
}`
}

const get_coord = (gareName) => {
    return `SELECT ?cood WHERE` +
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "${gareName}"} UNION` +
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "${gareName}"}.` +
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Coordinates> ?coord}`;
}

const get_weather = () => {
    return `SELECT ?temp ?wind ?rain WHERE {
        ?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7col6> ?col.
        ?col <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7temperature> ?y .
        ?col <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7vent_moyen> ?z .
        ?col <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Rain> ?rain .
        ?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7temperature> ?temp .
        ?z <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7vent_moyen> ?rain
    }`
};