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

var store = new Store({name:"test", overwrite:true}, function (err,store){
    store.load('text/n3', rdfGare, function (s,d){
        store.execute("SELECT ?subject ?predicate ?object WHERE {?subject ?predicate ?object} LIMIT 1", function (success, results){
            console.log(success, results)
        });
    });
})


/*
rdfstore.create(function(err, store) {
    store.execute('LOAD <http://dbpedia.org/resource/Tim_Berners-Lee> INTO GRAPH <http://example.org/people>', function() {
        store.setPrefix('dbp', 'http://dbpedia.org/resource/');
    });
    store.load("")
    console.log(store)

});*/

/*
var rdfstore = require('rdfstore')
, fs = require('fs');

rdfstore.create(function(store){
  var rdf = fs.readFileSync('/var/foo/bar.ttl').toString();
  store.load('text/turtle', rdf, function(s,d){
    console.log(s,d);
    store.execute("SELECT * WHERE { ?s ?p ?o } LIMIT 10", function(success, results){
      console.log(success, results);
    });
  });
});
 */