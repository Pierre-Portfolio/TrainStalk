
import * as jsonld from 'jsonld';
import * as fs from 'fs';

const GenerateRdfDynamic = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    const jsoncontains = JSON.parse(fs.readFileSync(data_contains, 'utf-8'))
    jsoncontext["itemListElement"].push(jsoncontains)

    const rdf = await jsonld.default.toRDF(jsoncontext, { format: 'application/n-quads' });
    return rdf
};

// a faire pour les 2 lien dynamique donc recup leur json respectif
const rdfGare = await GenerateRdfDynamic('./src/Onthologies/Data/Gare/context.json','./src/Onthologies/Data/Gare/data.json')
console.log(rdfGare)
//pour les requetes voir ce tuto
//https://zazuko.com/get-started/developers/
//https://www.npmjs.com/package/sparql-http-client