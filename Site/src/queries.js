const query_allGareName = "SELECT ?name WHERE{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> ?name}"

const query_uicFromGare = (gareName) =>{
    return `SELECT ?UIC WHERE`+
        `{ {?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7NomGare> "Marssac-sur-Tarn"} UNION`+
        `{?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7Ville> "Marssac-sur-Tarn" }.`+
        `?x <http://www.semanticweb.org/tompa/ontologies/2022/2/untitled-ontology-7IDGare> ?UIC}`;
}