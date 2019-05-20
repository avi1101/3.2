const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var DButilsAzure = require('./DButils');

app.get("/", (req, res) => {
    res.status(200).send("Hello World");
    console.log("Got GET Request");
});

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
});
