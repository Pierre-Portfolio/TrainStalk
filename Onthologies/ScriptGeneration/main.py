from rdflib import Graph, URIRef, Literal
from rdflib.serializer import Serializer
import json

data = open('test.txt', 'r').readlines()
str_data=""
for i in data:
    str_data = str_data+str(i)

data_context = json.load(open('context.json', 'r'))
data_gare = json.load(open('liste-des-gares.json', 'r'))

str_context = str(data_context)

context = data_context["@context"]

g = Graph().parse(str_data, format='application/rdf+owl')
#print(g.serialize(format='json-ld', indent=4))
