import json
from rdflib import Graph, Literal, RDF, URIRef
from rdflib.namespace import FOAF , XSD

data_context = json.load(open('../Data/Gare/context.json', 'r'))
data_gare = json.load(open('../Data/Gare/data.json', 'r'))

def GenerateJsonLD():
    data_context["itemListElement"].append(data_gare)
    with open("../Data/Gare/JsonLD.json","w",encoding="utf-8") as file:
        json.dump(data_context, file)
    return data_context
    
def GenerateRDF():
    str_data = GenerateJsonLD()
    g = Graph()
    g.parse(data=str_data, format='json-ld')
    
    rdf = ""
    for s, p, o in g:
        rdf += str(s) + " " + str(p) + " " + str(o) + " . "
    with open("../Data/Gare/result.txt","w",encoding="utf-8") as file:
        json.dump(rdf, file)