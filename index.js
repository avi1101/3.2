/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */

const db = require("./DButils.js");
const express = require("express");
var myParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;


app.use(myParser.urlencoded({extended: true}));

/*  #### example for post request JSON format ####

var myParser = require("body-parser");

app.use(myParser.urlencoded({extended: true}));

//form contains firstname and lastname
app.post("/reg", (req, res)=>{
    console.log(req.body);
    console.log(req.body.firstname);
});

* */



// getUser(1)
//     .then(user => getInterests(user.id))
//     .then(interests => getLocation(interests[0]))
//     .then(location => console.log(location))
//     .catch(error => console.log(error.message));

function getPOI(POIId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Getting POI");
            app.get('/select', function(req, res){
                DButilsAzure.execQuery(`SELECT $(POIID) FROM tableName`)
                    .then(function(result){
                        res.send(result)
                    })
                    .catch(function(err){
                        console.log(err)
                        res.send(err)
                    })
            })
            resolve({ id: 1, name: "user1" });
        }, 3000);
    });
}

app.get("/", (req, res) => {
    res.status(200).send("Hello World");
    console.log("Got GET Request");
});

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
});

/**
 * save a POI to a user
 * @param = JSON ({username, POI id})
 */
app.post("/save", (req, res)=>{
    var user = req.body.username;
    var poi = req.body.POIid;
    console.log("user: "+user+"\npoi: "+poi);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Getting User");
            app.get('/select', function(req, res){
                DButilsAzure.execQuery("SELECT $(user) FROM users")
                    .then(function(result){
                        res.send(result)
                    })
                    .catch(function(err){
                        console.log(err)
                        res.send(err)
                    })
            })
            resolve({ id: 1, name: "user1" });
        }, 3000);
    });
});
