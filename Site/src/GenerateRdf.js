
import * as jsonld from 'jsonld';
import * as fs from 'fs';

const RecupDynamicLien = async (lien) => {
    let jsonLdData = JSON.parse(fs.readFileSync(lien, 'utf-8'))
    const rdf = await jsonld.default.toRDF(jsonLdData, { format: 'application/n-quads' });
    return rdf
};

const GenerateRdfDynamic = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    const jsoncontains = JSON.parse(fs.readFileSync(data_contains, 'utf-8'))
    jsoncontext["itemListElement"].push(jsoncontains)

    const rdf = await jsonld.default.toRDF(jsoncontext, { format: 'application/n-quads' });
    return rdf
};

const rdfGare = RecupDynamicLien('./src/Onthologies/Data/Gare/jsonLD.json')
const rdfFinal = rdfGare

// a faire pour les 2 lien dynamique donc recup leur json respectif
GenerateRdfDynamic('./src/Onthologies/Data/Gare/context.json','./src/Onthologies/Data/Gare/data.json')

//pour les requetes voir ce tuto
//https://zazuko.com/get-started/developers/
//https://www.npmjs.com/package/sparql-http-client