const jsonld = require('jsonld');
const fs = require('fs');

const GenerateRdfDynamicWithoutUrl = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    jsoncontext["itemListElement"].push(data_contains)

    const rdf = await jsonld.toRDF(jsoncontext, {
        format: 'application/n-quads'
    });
    return rdf
};

exports.GenerateRdfDynamicWithoutUrl = GenerateRdfDynamicWithoutUrl;

const GenerateRdfDynamic = async (data_context, data_contains) => {
    let jsoncontext = JSON.parse(fs.readFileSync(data_context, 'utf-8'))
    const jsoncontains = JSON.parse(fs.readFileSync(data_contains, 'utf-8'))
    jsoncontext["itemListElement"].push(jsoncontains)

    const rdf = await jsonld.toRDF(jsoncontext, {
        format: 'application/n-quads'
    });
    return rdf
};

exports.GenerateRdfDynamic = GenerateRdfDynamic;