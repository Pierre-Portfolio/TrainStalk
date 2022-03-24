const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const app = express()
const PORT = 8092;

module.exports = app;

app.use(express.static('public'));
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/trajet/gare/search', (request, response) => {/*recup trajet gare arrive et depart*/});

app.get('/trajet/:num_gare', (request, response) => {/*recup trajet nb train*/});

app.get('/', (request, response) => {/*recup gare*/});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);