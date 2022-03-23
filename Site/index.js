const express = require("express");
const app = express()

app.use(express.static('public'));

app.listen(80,
    () => console.log("server listening on port 80")
);