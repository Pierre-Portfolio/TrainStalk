import * as jsonld from 'jsonld';
import * as fs from 'fs';
import * as d3 from 'd3-sparql';
import * as fetch from 'isomorphic-fetch';

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

import * as rdfstore from 'rdfstore'

var prefix = "PREFIX owl:http://www.w3.org/2002/07/owl#\n" +
    "PREFIX rdf:http://www.w3.org/1999/02/22-rdf-syntax-ns#\n" +
    "PREFIX xml:http://www.w3.org/XML/1998/namespace\n" +
    "PREFIX xsd:http://www.w3.org/2001/XMLSchema#\n" +
    "PREFIX rdfshttp://www.w3.org/2000/01/rdf-schema#";



//fs.writeFileSync('rdfGare.rdf', rdfGare)