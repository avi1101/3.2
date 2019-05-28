/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */

const DButilsAzure = require('./DButils.js');
const express = require("express");
const xml2js = require('xml2js');
var myParser = require("body-parser");
const fs = require('fs-mode');
const jwt = require("jsonwebtoken");
const poi = require("./POIs_module");
const usr = require("./user_module");
const au = require("./auth");
const app = express();

const port = process.env.PORT || 3000;
var secret = "Max1,000,000IraqiDinars";

app.use(myParser.urlencoded({extended: true}));
app.use(express.json());
app.use("/logged", (req, res, next)=>{
    const token = req.header("x-auth-token");
    if (!token)
        res.status(401).send("Access denied. No token provided.");
    else
        try {
            const decoded = jwt.verify(token, secret);
            req.decoded = decoded;
            next();
        } catch (exception) {
            res.status(400).send("Invalid token.");
        }
});
app.use("/", au);
app.use("/", poi);
app.use("/", usr);


app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

