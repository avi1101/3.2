/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */


const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var ConnectionPool = require('tedious-connection-pool');
const DButilsAzure = require('./DButils');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const db =
    {
        userName: 'group1101',
        password: 'AviElad308',
        server: 'assignment3webdevstudents.database.windows.net',
        options:
            {
                database: 'Assignment3db'
                , encrypt: true
            }
    };
const connect = new Connection(db);
getUser(1)
    .then(user => getInterests(user.id))
    .then(interests => getLocation(interests[0]))
    .then(location => console.log(location))
    .catch(error => console.log(error.message));

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
