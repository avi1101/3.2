/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */

const DButilsAzure = require('./DButils.js');
const express = require("express");
var myParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});
// app.use('./modules/checkuser', checkuser);
// app.use('./modules/poi', poi);



/**
 * save a POI to a user
 * @param = JSON ({username, POI id})
 */
app.post("/save", (req, res)=>{
    var user = req.body.username;
    var poi = req.body.POIid;
    console.log("user: "+user+"\npoi: "+poi);
    var results = DButilsAzure.execQuery("INSERT INTO user_poi (POIID, username) VALUES(\'" + poi + "\',\'" + user + "\')");
    results.then(function (result) {
        res.status(200).send("Point of Interest was registered!");
    }).catch(function(error) {
        res.status(400).send("Point of Interest already registered for the current user");
    });
});

/**
 * delete a POI to a user
 * @param = JSON ({username, POI id})
 */
app.delete("/delete/:user/:POIid", (req,res) => {
    var user = req.params.user;
    var poi = req.params.POIid;
    var results = DButilsAzure.execQuery("DELETE FROM user_poi WHERE POIID=\'"+poi+"\' AND username=\'"+user+"\'");
    results.then(function (result) {
        res.status(200).send("Point of Interest was deleted!");
    }).catch(function(error) {
        res.status(400).send("Point of Interest does not exist for the current user");
    });
});

/**
 * returns the number of viewed POIs of a user
 * @params = user
 */
app.get("/viewedpois", (req, res) => {
    var user = req.query['username'];
    var results = DButilsAzure.execQuery("SELECT * FROM user_poi WHERE username=\'"+user+"\'");
    Promise.all([results]).then(function(values) {
        //console.log(values);
        var x = values[0];
        console.log(x.length);
        res.status(200).send("The user "+user+" has: "+x.length+" POIs in record");
    });
});


/*************************************************************************************
 *                                                                                   *
 *                                   Helper methods                                  *
 *                                                                                   *
 *************************************************************************************/

function IsExist(data, table)
{
    var query = "";
    if(table === "users")
        query = "SELECT * FROM user_poi WHERE username=\'"+data+"\'"
}