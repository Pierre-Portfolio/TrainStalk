const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const oxigraph = require('oxigraph');
const {GenerateRdfDynamic, GenerateRdfDynamicWithoutUrl} = require('./src/GenerateRdf.js');

const app = express()
const PORT = 8092;
const fs = require('fs')

app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(helmet());

app.options('/{*splat}', cors());

const loadStore = (rdfNQuads) => {
    const store = new oxigraph.Store();
    store.load(rdfNQuads, {format: 'application/n-quads'});
    return store;
}

/*recup trajet gare arrive et depart*/
app.post('/meteo', async (request, response) => {
    console.log("Debut /meteo");
    try {
        const rdfWeather = await GenerateRdfDynamicWithoutUrl("./src/Onthologies/Data/Weather/context.json", request.body);
        const store = loadStore(rdfWeather);
        const res = store.query(get_weather());
        if (res.length !== 0) {
            let resp = {"rain": res[0].get('rain').value, "wind": res[0].get('wind').value, "tempValue": res[0].get('tempValue').value};
            response.send({"weather": resp})
        } else {
            response.send({"success": false})
        }
    } catch (e) {
        console.log(e);
        response.send({"success": false})
    }
})

/*recup trajet gare arrive et depart*/
app.post('/trajet/gare/search', async (request, response) => {
    console.log("Debut /trajet/gare/search");
    let gare_dep = request.body.garedep;
    let gare_arr = request.body.garearr;
    try {
        const rdfGare = await GenerateRdfDynamic("./src/Onthologies/Data/Gare/context.json", "./src/Onthologies/Data/Gare/data.json");
        const store = loadStore(rdfGare);
        const findUic = (gareName) => {
            let res = store.query(query_uicFromGare(gareName));
            if (res.length === 0) {
                res = store.query(query_uicFromGare(gareName.toUpperCase()));
            }
            return res.length !== 0 ? res[0].get('UIC').value : null;
        };
        const uic_dep = findUic(gare_dep);
        const uic_arr = findUic(gare_arr);
        if (uic_dep !== null && uic_arr !== null) {
            response.send({
                "uic": {"garedep": uic_dep, "garearr": uic_arr},
                "success": true
            })
        } else {
            response.send({
                "success": false
            })
        }
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
        const store = loadStore(rdfTrajet);
        if (store.query(ASK_getJourney(id)) === true) {
            const res = store.query(getJourney(id));
            if (res.length !== 0) {
                let val_res = res.map(x => {
                    return {
                        "station_name ": x.get('stop_name').value,
                        "arrival ": x.get('arrival').value,
                        "departure ": x.get('depart').value,
                        "lat": x.get('lat').value,
                        "long": x.get('long').value,
                        "size": x.get('size').value
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
        } else {
            response.send({
                "success": false
            })
        }
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
        const store = loadStore(rdfGare);
        const res = store.query(query_allGareName);
        const val_ret = res.map(x => x.get('name').value);
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

/* Escape user input before embedding it in a SPARQL string literal */
const sparqlEscape = (value) => {
    return String(value).replace(/[\\"\n\r]/g, (c) => ({'\\': '\\\\', '"': '\\"', '\n': '\\n', '\r': '\\r'}[c]));
}

/* === Query === */
const query_allGareName = "SELECT ?name WHERE{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ?name}"

const query_uicFromGare = (gareName) => {
    gareName = sparqlEscape(gareName);
    return `SELECT ?UIC WHERE` +
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "${gareName}"} UNION` +
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "${gareName}" }.` +
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7IDGare> ?UIC}`;
}

/* == Check if idtrain == value in RDF ==*/ //TrainName a changer
const ASK_getJourney = (idtrain) => {
    return `ASK {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7train_id> "${sparqlEscape(idtrain)}"}`
}

const getJourney = (idtrain) => {
    return `SELECT ?arrival ?depart ?stop_name ?lat ?long ?size WHERE {
?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7train_id> "${sparqlEscape(idtrain)}".
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
    gareName = sparqlEscape(gareName);
    return `SELECT ?cood WHERE` +
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "${gareName}"} UNION` +
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "${gareName}"}.` +
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Coordinates> ?coord}`;
}

const get_weather = () => {
    return `SELECT ?rain ?wind ?tempValue WHERE {
        ?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7col5> ?val .
        ?val <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Rain> ?rain .
        ?val <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7vent_moyen> ?ventMoy .
        ?ventMoy <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Wind> ?wind .
        ?val <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7temperature> ?temp .
        ?temp <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Temperature> ?tempValue
    }`
};
