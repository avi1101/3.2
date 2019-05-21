/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */
//SELECT TOP (2) * FROM [dbo].[pois] WHERE category='cat' ORDER BY rank DESC;
const DButilsAzure = require('./DButils.js');
const express = require("express");
var myParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(myParser.urlencoded({extended: true}));
// app.use('./modules/checkuser', checkuser);
// app.use('./modules/poi', poi);

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

/**
 * this method returns a list of all the available categories
 */
app.get("/categories", (req,res)=>{
    var cats = DButilsAzure.execQuery("SELECT DISTINCT category FROM pois;");
    cats.then(function(result){
        res.status(200).send(result);
    }).catch(function(error) {
        res.status(200).send("An Error occured");
    });
});


/**
 * this method gets 2 categories and return the 2 maximum ranked POIs in the categories
 * @params = category1, category2
 */
app.get("/getrecommended", (req,res)=>{
    var cat1 = req.query['category1'];
    var cat2 = req.query['category2'];

    var pro_cat1 = DButilsAzure.execQuery("SELECT TOP (1) * FROM pois WHERE category=\'"+cat1+"\' ORDER BY rank DESC");
    var pro_cat2 = DButilsAzure.execQuery("SELECT TOP (1) * FROM pois WHERE category=\'"+cat2+"\' ORDER BY rank DESC");

    // var pro_cat1 = DButilsAzure.execQuery("SELECT *, MAX(rank) FROM pois WHERE category=\'"+cat1+"\'");
    // var pro_cat2 = DButilsAzure.execQuery("SELECT *, MAX(rank) FROM pois WHERE category=\'"+cat2+"\'");

    Promise.all([pro_cat1, pro_cat2]).then(function(values){
        var list = {};
        list.cat1 = values[0];
        list.cat2 = values[1];
        res.status(200).send(list);
    }).catch(function(error) {
        res.status(200).send("One of the categories does not exist");
    });
});

/**
 * save a POI to a user
 * @param = JSON ({username, POIid})
 */
app.post("/save", (req, res)=>{
    var user = req.body.username;
    var poi = req.body.POIid;
    console.log("user: "+user+"\npoi: "+poi);
    var results = DButilsAzure.execQuery("INSERT INTO user_poi (POIID, username) VALUES(\'" + poi + "\',\'" + user + "\')");
    results.then(function (result) {
        res.status(200).send("Point of Interest was registered!");
    }).catch(function(error) {
        res.status(400).send("Could not add POI to the user");
    });
});

/**
 * delete a POI
 * @param = POIid
 */
app.post("/delete/:POIid", (req,res) => {
    var poi = req.params.POIid;
    var results = DButilsAzure.execQuery("DELETE FROM user_poi WHERE POIID=\'"+poi+"\'");
    results.then(function (result) {
        var delfrompoi = DButilsAzure.execQuery("DELETE FROM pois WHERE ID=\'"+poi+"\'");
        delfrompoi.then(function(x){
            res.status(200).send("POI deleted.");
        }).catch(function(error){
            res.status(200).send("Could not delete the POI");
        });
    }).catch(function(error) {
        res.status(200).send("Could not delete the POI, it does not exist");
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
    }).catch(function(error) {
        res.status(400).send("Could not find POI number for the given user");
    });
});

/**
 * returns a list of all the POIs that the given user has registered
 * @parsms = user
 */
app.get("/usergetPOI", (req, res) => {
    var user = req.query['username'];
    var results = DButilsAzure.execQuery("SELECT * FROM user_poi WHERE username=\'"+user+"\'");
    results.then(function(result){
        var list = [];
        for(var i = 0; i < result.length; i++)
            list.push(result[i].POIID);
        res.status(200).send(list);
    }).catch(function(error) {
        res.status(200).send("User does not exist!");
    });
});

/**
 * returns a list of POIs that beling to category
 * @params = category
 */
app.get("/getAllPOIsbyCat", (req, res)=>{
    var cat = req.query['category'];
    var results = DButilsAzure.execQuery("SELECT * FROM pois WHERE category=\'"+cat+"\'");
    results.then(function(result){
        res.status(200).send(result);
    }).catch(function(error) {
        res.status(200).send("Category does not exist!");
    });
});

/**
 * returns a list of POIs that has the given rank
 * @params = rank
 */
app.get("/getAllPOIsBbyRank", (req, res)=>{
    var rank = req.query['rank'];
    var results = DButilsAzure.execQuery("SELECT * FROM pois WHERE rank=\'"+rank+"\'");
    results.then(function(result){
        res.status(200).send(result);
    }).catch(function(error) {
        res.status(200).send("Rank does not exist!");
    });
});

/**
 * update POI , add rank and review
 * @params = JSON(POI, rank, review)
 */
app.post("/addrank", (req,res)=>{
    var poi = req.body.POIid;
    var rank = req.body.rank;
    var review = req.body.review;
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;
    console.log(poi+", "+rank+", "+review)+", "+newdate;
    var n = 0;
    var r = 0;
    var results = DButilsAzure.execQuery("SELECT * FROM pois WHERE ID=\'"+poi+"\'");
    results.then(function(result){
       n = result[0].numranked;
       r = result[0].rank;
       r = r*n;
       r = r+parseFloat(rank);
       r = r/(n+1);
       console.log(n+", "+r+", "+review);
       var update = DButilsAzure.execQuery("UPDATE pois SET rank="+r+",numranked="+(n+1)+" WHERE ID="+poi);
       update.then(function(up){
           if(review !== "") {
               var review_up = DButilsAzure.execQuery("INSERT INTO poi_review (POIID, review, date) VALUES(\'" + poi + "\',\'" + review + "\',\'" + newdate + "\')");
               review_up.then(function (end) {
                   res.status(200).send("Rank and review updated!");
               }).catch(function (error) {
                   res.status(200).send("Could not update the review");
               });
           }
           else
               res.status(200).send("Rank updated!");
       }).catch(function(error){
           res.status(200).send("Could not update the POI");
       });
    }).catch(function(error){
        res.status(200).send("Could not update the POI");
    });
});


app.get("/POI_getList", (req,res)=>{
    var list = req.query.list;
    for(var i = 0; i < list.length; i++) {
        console.log(list[i]);
    }
    var empty = list.length == 0;
    var results = null;
    if(empty)
        results = DButilsAzure.execQuery("SELECT * FROM pois");
    else
    {
        var query = "SELECT * FROM pois WHERE ";
        for(var i = 0; i < list.length; i++) {
            if(i == 0)
                query += "category=\'" + list[i] + "\'";
            else
                query += " OR category=\'" + list[i] + "\'";
        }
        results = DButilsAzure.execQuery(query);
    }
    results.then(function(result){
        res.status(200).send(result);
    }).catch(function(error){
        res.status(200).send("one of the categories was invalid, please provide a valid category.");
    });
});
