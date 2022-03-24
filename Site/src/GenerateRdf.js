
import * as jsonld from 'jsonld';
import * as fs from 'fs';
import * as d3 from 'd3-sparql';
import * as fetch from 'isomorphic-fetch';

const GenerateRdfDynamic = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    const jsoncontains = JSON.parse(fs.readFileSync(data_contains, 'utf-8'))
    jsoncontext["itemListElement"].push(jsoncontains)

    const rdf = await jsonld.default.toRDF(jsoncontext, { format: 'application/n-quads' });
    return rdf
};

// a faire pour les 2 lien dynamique donc recup leur json respectif
const rdfGare = await GenerateRdfDynamic('./src/Onthologies/Data/Gare/context.json','./src/Onthologies/Data/Gare/data.json')
//console.log(rdfGare.slice(0,10000))
fs.writeFileSync('rdfGare.rdf', rdfGare)

const td3 = fs.readFileSync('TD 3.owl', 'utf-8');
console.log(td3)


const query = `
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xml: <http://www.w3.org/XML/1998/namespace>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?x ?y ?z
WHERE {?x ?y ?z} 
LIMIT 100
`


d3.sparql(td3, query).then(function(data) {
  console.log(data)
})

//pour les requetes voir ce tuto
//https://zazuko.com/get-started/developers/
//https://www.npmjs.com/package/sparql-http-client
//https://callidon.github.io/sparql-engine/

/*
SELECT ?subject ?predicate ?object
WHERE {?subject ?predicate ?object} 
LIMIT 100
*/