import * as jsonld from 'jsonld';
import * as fs from 'fs';
import * as rdfstore from 'rdfstore'

export const GenerateRdfDynamicWithoutUrl = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    jsoncontext["itemListElement"].push(data_contains)

    const rdf = await jsonld.default.toRDF(jsoncontext, { format: 'application/n-quads' });
    return rdf
};

export const GenerateRdfDynamic = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    const jsoncontains = JSON.parse(fs.readFileSync(data_contains, 'utf-8'))
    jsoncontext["itemListElement"].push(jsoncontains)

    const rdf = await jsonld.default.toRDF(jsoncontext, { format: 'application/n-quads' });
    return rdf
};

// a faire pour les 2 lien dynamique donc recup leur json respectif


//const rdfGare = await GenerateRdfDynamic('./src/Onthologies/Data/Gare/context.json','./src/Onthologies/Data/Gare/data.json')
//console.log(rdfGare)
const rdfTrajet = await GenerateRdfDynamic('./src/Onthologies/Data/Train/context.json','./src/Onthologies/Data/Train/trajet-data.json')
console.log(rdfTrajet);

var prefix = "PREFIX owl:http://www.w3.org/2002/07/owl#\n" +
    "PREFIX rdf:http://www.w3.org/1999/02/22-rdf-syntax-ns#\n" +
    "PREFIX xml:http://www.w3.org/XML/1998/namespace\n" +
    "PREFIX xsd:http://www.w3.org/2001/XMLSchema#\n" +
    "PREFIX rdfs:http://www.w3.org/2000/01/rdf-schema#";

//let q = `SELECT ?stop_name ?arrival WHERE {{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Train_id> "9580".?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_times> ?y. ?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_point> ?z. ?z <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Station_Name> ?stop_name} UNION {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Train_id> "9580". ?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_times> ?y. ?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Arrive> ?arrival }}`

let q = `SELECT ?arrival ?depart ?stop_name ?lat ?long WHERE {
?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7train_id> "9580".
?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_times> ?y.
?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Arrive> ?arrival.
?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Depart> ?depart.
?y <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7stop_point> ?z.
?z <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Name> ?stop_name.
?z <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7coord> ?a.
?a <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7TrainLatitude> ?lat.
?a <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7TrainLongitude> ?long
}`

/*
let q = `ASK {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7train_id> "9580"}`
*/
var store = new Store({name:"test", overwrite:true}, function (err,store){
    store.load('text/n3', rdfTrajet, function (s,d){
        store.execute(q, function (success, results){
            console.log(results)
        });
    });
});

//fs.writeFileSync('./src/Onthologies/Data/Gare/gare-data.nq', rdfGare)