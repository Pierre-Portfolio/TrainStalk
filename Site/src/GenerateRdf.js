import * as jsonld from 'jsonld';
import * as fs from 'fs';
import * as rdfstore from 'rdfstore'

export const GenerateRdfDynamic = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    const jsoncontains = JSON.parse(fs.readFileSync(data_contains, 'utf-8'))
    jsoncontext["itemListElement"].push(jsoncontains)

    const rdf = await jsonld.default.toRDF(jsoncontext, { format: 'application/n-quads' });
    return rdf
};

// a faire pour les 2 lien dynamique donc recup leur json respectif


const rdfGare = await GenerateRdfDynamic('./src/Onthologies/Data/Gare/context.json','./src/Onthologies/Data/Gare/data.json')
//console.log(rdfGare)


var prefix = "PREFIX owl:http://www.w3.org/2002/07/owl#\n" +
    "PREFIX rdf:http://www.w3.org/1999/02/22-rdf-syntax-ns#\n" +
    "PREFIX xml:http://www.w3.org/XML/1998/namespace\n" +
    "PREFIX xsd:http://www.w3.org/2001/XMLSchema#\n" +
    "PREFIX rdfs:http://www.w3.org/2000/01/rdf-schema#";

let q = `SELECT ?UIC WHERE`+
    `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "Mareil-sur-Mauldre"} UNION`+
    `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "Mareil-sur-Mauldre" }.`+
    `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7IDGare> ?UIC}`

/*
var store = new Store({name:"test", overwrite:true}, function (err,store){
    store.load('text/n3', rdfGare, function (s,d){
        store.execute(q, function (success, results){
            console.log(results)
        });
    });
});
*/
fs.writeFileSync('./src/Onthologies/Data/Gare/gare-data.nq', rdfGare)