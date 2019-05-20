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
const DButilsAzure = require('./DButils');

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});
app.use('./modules/checkuser', checkuser);
app.use('./modules/poi', poi);



/**
 * save a POI to a user
 * @param = JSON ({username, POI id})
 */
app.post("/save", (req, res)=>{
    var user = req.body.username;
    var poi = req.body.POIid;
    console.log("user: "+user+"\npoi: "+poi);
    var results = DButilsAzure.execQuery("INSERT INTO user_poi (POIID, username) VALUES(\'"+poi+"\',\'"+user+"\')");
    results.then(function(result){
        //console.log(result.toString());
        // var mySubString = result.toString().substring(
        //     result.toString().indexOf("\'") + 1,
        //     result.toString().lastIndexOf("\'")
        // );
        // mySubString = mySubString +','+ poi;
        // //console.log(mySubString);
        // DButilsAzure.execQuery("UPDATE users SET POIs=\'"+mySubString+"\' WHERE username=\'"+user+"\'");
        // res.status(200).send(result);
        console.log("###########################");
        console.log(result);
        console.log(result.data);
    });

});
