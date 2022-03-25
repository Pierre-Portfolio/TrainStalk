const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const query = require('./src/queries.js');


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
    var store = new Store({name:"test", overwrite:true}, function (err,store){
        store.load('text/n3', rdfGare, function (s,d){
            store.execute(q, function (success, results){
                console.log(results)
            });
        });
    })
});

/*recup trajet nb train*/
app.post('/trajet/id', (request, response) =>
{
    saveJson("./src/Onthologies/Data/Train/trajet-data.json",JSON.stringify((request.body)));
    (async () =>{
        try {
            const module = await import('./src/GenerateRdf.js');
            const rdfTrajet = await module.GenerateRdfDynamic("./src/Onthologies/Data/Train/context.json","./src/Onthologies/Data/Train/trajet-data.json")
            response.send({"rdf":rdfTrajet,"success":true})
        }catch (e){
            console.log(e);
            response.send({"success":false})
        }

    })();
});

/*recup gare*/
app.get('/gare', (request, response) => {});

app.get('/', (request, response) => {});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
console.log(`Open it with http://localhost:${PORT}`)

/* === function === */

function saveJson(textName, jsonData) {
    fs.writeFile(textName, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

const runRDF = async (context, data) =>{
    const rdf = import('./src/GenerateRdf.js').then(async module => {
        const rdfTrajet = await GenerateRdfDynamic("./src/Onthologies/Data/Train/context.json","./src/Onthologies/Data/Train/trajet-data.json")
    })
}