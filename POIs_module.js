const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');
const xml2js = require('xml2js');
var myParser = require("body-parser");
module.exports = router;

router.use(myParser.urlencoded({extended: true}));
router.use(express.json());


/**
 * this method returns a list of all the available categories
 */
router.get("/categories", (req,res)=>{
    var cats = DButilsAzure.execQuery("SELECT DISTINCT category FROM pois;");
    cats.then(function(result){
        res.status(200).send(result);
        console.log(result);
    }).catch(function(error) {
        res.status(500).send("An Error occured");
    });
});

/**
 * this method gets 2 categories and return the 2 maximum ranked POIs in the categories
 * @params = category1, category2
 */
router.get("/logged/getrecommended", (req,res)=>{
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
        res.status(500).send("Internal Error, try again later");
    });
});

/**
 * delete a POI
 * @param = POIid
 */
router.post("/logged/delete/:POIid", (req,res) => {
    if(req.decoded.admin) {
        var poi = req.params.POIid;
        var results = DButilsAzure.execQuery("DELETE FROM user_poi WHERE POIID=\'" + poi + "\'");
        results.then(function (result) {
            var delfrompoi = DButilsAzure.execQuery("DELETE FROM pois WHERE ID=\'" + poi + "\'");
            delfrompoi.then(function (x) {
                res.status(200).send("POI deleted.");
            }).catch(function (error) {
                res.status(200).send("Could not delete the POI");
            });
        }).catch(function (error) {
            res.status(200).send("Could not delete the POI, it does not exist");
        });
    }
    else
        res.status(401).send("only an admin can perform this action");
});

/**
 * returns a list of POIs that belong to category
 * @params = category
 */
router.get("/getAllPOIsbyCat", (req, res)=>{
    var cat = req.query['category'];
    var results = DButilsAzure.execQuery("SELECT * FROM pois WHERE category=\'"+cat+"\'");
    results.then(function(result){
        res.status(200).send(result);
    }).catch(function(error) {
        res.status(500).send("Internal Error, please try again");
    });
});

router.get('/getpoibyname/:name', (req,res)=> {
    let name = req.params.name;
    if(name==null){
        return res.status(400).send("name is null");}
    let getidQuery = "SELECT * FROM pois WHERE name = \'"+name+"\'";
    let response= DButilsAzure.execQuery(getidQuery);
    response.then(function(result){
        if (result.length === 0) res.status(400).json({message: 'POI not in system'});
        else {
            let views = result[0].viewed_num + 1;
            let increaseQuery = "UPDATE pois SET viewed_num =\'"+views+"\' WHERE name = \'"+name+"\'";
            res.status(200).send(result[0]);
            DButilsAzure.execQuery(increaseQuery).then((response) =>{
            }).catch((err) =>{
                res.status(500).json({message:'Error on the server. try again later11.'});
            });
        }
    })
        .catch((err) =>{
            res.status(500).json({message:err+'             Error on the server. try again later22.'});
        });
});
//TODO: added this because we needed to get POI by ID when searching for user's POIS
router.get('/getpoibyID/:id', (req,res)=> {
    let name = req.params.id;
    if(name==null){
        return res.status(400).send("name is null");}
    let getidQuery = "SELECT * FROM pois WHERE ID = \'"+name+"\'";
    let response= DButilsAzure.execQuery(getidQuery);
    response.then(function(result){
        if (result.length === 0) res.status(400).json({message: 'POI not in system'});
        else {
            let views = result[0].viewed_num + 1;
            let increaseQuery = "UPDATE pois SET viewed_num =\'"+views+"\' WHERE name = \'"+name+"\'";
            res.status(200).send(result[0]);
            DButilsAzure.execQuery(increaseQuery).then((response) =>{
            }).catch((err) =>{
                res.status(500).json({message:'Error on the server. try again later11.'});
            });
        }
    })
        .catch((err) =>{
            res.status(500).json({message:err+'             Error on the server. try again later22.'});
        });
});

router.get("/rand3POI/:rank", (req,res)=> {
    let rank = req.params.rank;
    if(rank==null){
        return res.status(400).send("rank was not entered");}
    let getidQuery = "SELECT * FROM pois WHERE rank >= \'"+rank+"\'";
    let response= DButilsAzure.execQuery(getidQuery);
    response.then(function(result){

        if (result.length ===0){ res.status(400).json({message: 'not enough POIs'});}
        if (result.length<3){ res.status(200).send(result);}
        else {
            let first = Math.floor(Math.random() * (result.length - 1));
            let second =  Math.floor(Math.random() * (result.length - 1));
            while(second===first){
                second =  Math.floor(Math.random() * (result.length - 1));
            }
            let third =  Math.floor(Math.random() * (result.length - 1));
            while(third===first || third===second){
                third =  Math.floor(Math.random() * (result.length - 1));
            }
            var newresult=[];
            newresult[0]=result[first];
            newresult[1]=result[second];
            newresult[2]=result[third];
            res.status(200).send(newresult);
        }
    })
        .catch((err) =>{
            res.status(500).json({message:err + 'Error on the server. try again later.'});
        });
});


/**
 * update POI , add rank and review
 * @params = JSON(POI, rank, review)
 */
router.post("/logged/addrank", (req,res)=>{
    var poi = req.body.POIid;
    var rank = req.body.rank;
    var review = req.body.review;
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;
    rank = (rank*0.2);
    console.log(poi+", "+rank+", "+review+", "+newdate);
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
                var review_up = DButilsAzure.execQuery("INSERT INTO poi_review (POIID, review, date, username) VALUES(\'" + poi + "\',\'" + review + "\', GETDATE(), \'"+req.decoded.id+"\')");
                review_up.then(function (end) {
                    res.status(200).send("Rank and review updated!");
                }).catch(function (error) {
                    res.status(500).send("Could not update the review");
                });
            }
            else
                res.status(200).send("Rank updated!");
        }).catch(function(error){
            res.status(500).send("Could not update the POI");
        });
    }).catch(function(error){
        res.status(500).send("Could not update the POI");
    });
});


router.get("/logged/POI_getList", (req,res)=>{
    var list = req.body;
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
        res.status(500).send("Internal Error, please try again later");
    });
});

/**
 * returns a list of the 2 top reviews a POI has
 */
router.get("/getTopReviews/:poi", (req,res)=>{
    let poi = req.params.poi;
    var result = DButilsAzure.execQuery("SELECT TOP(2) * FROM poi_review WHERE POIID="+poi+" ORDER BY date DESC");
    result.then(function(reslt){
        res.status(200).send(reslt);
    }).catch(function(error){
        res.status(500).send("Internal Error, please try again later");
    });
});

/**
 * returns a list of the 2 top reviews a POI has
 */
router.get("/getTopReviewsByName/:poi", (req,res)=>{
    let poi = req.params.poi;
    var name = DButilsAzure.execQuery("SELECT ID FROM pois WHERE name=\'"+poi+"\'");
    name.then(function(reslt_name){
        var result = DButilsAzure.execQuery("SELECT TOP(2) * FROM poi_review WHERE POIID="+reslt_name[0]['ID']+" ORDER BY date DESC");
        result.then(function(reslt){
            res.status(200).send(reslt);
        }).catch(function(error){
            res.status(500).send("Internal Error, please try again later");
        });
    });
});
