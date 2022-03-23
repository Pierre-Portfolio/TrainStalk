
import * as jsonld from 'jsonld';
import * as fs from 'fs';

const GenerateRdfDynamic = async (lien) => {
    let jsonLdData = JSON.parse(fs.readFileSync(lien, 'utf-8'))
    const rdf = await jsonld.default.toRDF(jsonLdData, { format: 'application/n-quads' });
    return rdf
};

const rdfGare = GenerateRdfDynamic('./src/Onthologies/Data/Gare/jsonLD.json')