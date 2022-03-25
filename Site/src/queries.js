const query_allGareName = "SELECT ?name WHERE{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ?name}"

const query_uicFromGare = (gareName) =>{
    return `SELECT ?UIC WHERE`+
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ${gareName}} UNION`+
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> ${gareName} }.`+
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7IDGare> ?UIC}`;
}

/* == Check if idtrain == value in RDF ==*/ //TrainName a changer
const ASK_getJourney = (idtrain) => {
    return `ASK {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Name> ${idtrain}}`
}

const getJourney = (idtrain) => {
    return `SELECT * WHERE {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Name> ${idtrain}}`
}

const get_coord = (gareName) => {
    return `CONSTRUCT {${gareName} <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7hasCoordinates> ?coord} WHERE`+
    `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ${gareName}} UNION`+
    `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> ${gareName} }.`+
    `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Coordinates> ?coord}`;
}

const meteo = (city) => {
    return `SELECT ?weather ?temp WHERE`+
    `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Weather> ${city}}.` +
    `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Temperature> ?weather}.` +
    `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Weather> ?temp}.`;
}