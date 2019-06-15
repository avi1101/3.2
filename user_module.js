const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');
const xml2js = require('xml2js');
var myParser = require("body-parser");
module.exports = router;

router.use(myParser.urlencoded({extended: true}));
router.use(express.json());

/**
 * this method returns the user record
 * if - the user is an admin, it will return the record of the given user
 * else - it will always return the record of the logged user
 * @params = username
 */
router.get('/logged/getuser/:user', (req,res)=>{
    var user = "";
    if(req.decoded.admin)
        user = req.params.user;
    else
        user = req.decoded.id;
    var results = DButilsAzure.execQuery("SELECT * FROM users WHERE username=\'"+user+"\'");
    results.then(function(result){
        if(result.length > 0)
            res.status(200).send(result);
        else
            res.status(404).send("User not found");
    }).catch(function(error) {
        res.status(500).send("An Error occured");
    });
});


/**
 * save a POI to a user
 * @param = JSON ({username, POIid})
 */
router.post("/logged/save", (req, res)=>{
    var user = req.body.username;
    var poi = req.body.POIid;
    var results = DButilsAzure.execQuery("INSERT INTO user_poi (POIID, username, date) VALUES(\'" + poi + "\',\'" + user + "\', GETDATE())");
    results.then(function (result) {
        res.status(200).send("Point of Interest was registered!");
    }).catch(function(error) {
        res.status(400).send("Could not add POI to the user");
    });
});


/**
 * returns the number of viewed POIs of a user
 * @params = user
 */
router.get("/logged/viewedpois", (req, res) => {
    var user = req.query['username'];
    var results = DButilsAzure.execQuery("SELECT * FROM user_poi WHERE username=\'"+user+"\'");
    Promise.all([results]).then(function(values) {
        var x = values[0];
        //console.log(x.length);
        res.status(200).send(x.length+"");
    }).catch(function(error) {
        res.status(400).send("Could not find POI number for the given user");
    });
});

/**
 * returns a list of all the POIs that the given user has registered
 * @parsms = user
 */
router.get("/logged/usergetPOI", (req, res) => {
    var user = req.query['username'];
    console.log(user);
    var results = DButilsAzure.execQuery("SELECT * FROM user_poi WHERE username=\'"+user+"\'");
    results.then(function(result){
        var list = [];
        for(var i = 0; i < result.length; i++)
            list.push(result[i].POIID);
        res.status(200).send(list);
    }).catch(function(error) {
        res.status(500).send("Internal Error, please try again");
    });
});

/**
 * returns a list of POIs that has the given rank
 * @params = rank
 */
router.get("/getAllPOIsBbyRank", (req, res)=>{
    var rank = req.query['rank'];
    var results = DButilsAzure.execQuery("SELECT * FROM pois WHERE rank=\'"+rank+"\'");
    results.then(function(result){
        res.status(200).send(result);
    }).catch(function(error) {
        res.status(500).send("Internal Error, please try again");
    });
});

router.get('/getpoibyID/:id', (req,res)=> {
    let id = req.params.id;
    if(id==null){
        return res.status(400).send("id is null");}
    let getidQuery = "SELECT * FROM pois WHERE ID = \'"+id+"\'";
    let response= DButilsAzure.execQuery(getidQuery);
    response.then(function(result){
        if (result.length === 0) res.status(400).json({message: 'POI not in system'});
        else {
            let views = result[0].viewed_num + 1;
            let increaseQuery = "UPDATE pois SET viewed_num =\'"+views+"\' WHERE ID = \'"+id+"\'";
            res.status(200).send(result[0]);
            DButilsAzure.execQuery(increaseQuery).then((response) =>{
            }).catch((err) =>{
                res.status(500).json({message:'Error on the server. try again later11.'});
            });
        }
    })
        .catch((err) =>{
            res.status(500).json({message:err+'Error on the server. try again later22.'});
        });
});

router.get("/getquestion/:username", (req,res)=> {
    let username = req.params.username;
    if(username==null){
        return res.status(400).send("username was not entered");}
    let getidQuery = "SELECT question1,question2 FROM users WHERE username =\'"+username+"\'";
    let response= DButilsAzure.execQuery(getidQuery);
    response.then(function(result){
        if (result.length === 0) res.status(400).json({message: 'user not in system'});
        else {
            res.status(200).send(result[0]);
        }
    })
        .catch((err) =>{
            res.status(500).json({message:'Error on the server. try again later.'});
        });
});


router.get("/logged/last2POIs/:username",(req,res)=> {
    let username = req.params.username;
    if(username==null){
        res.status(400).send("username was not entered");}
    else{let getidQuery = "SELECT TOP(2) * FROM user_poi WHERE username= \'"+username+"\' ORDER BY date ASC";
        let response= DButilsAzure.execQuery(getidQuery);
        response.then(function(result){
            if(result.length===0){res.status(400).send("no POI saved");}
            else if(result.length===1){res.status(200).send(result);}
            else{

                res.status(200).send(result);}
        })      .catch((err) =>{
            res.status(500).json({message:err +'Error on the server. try again later.'});
        });}
});


router.get("/logged/2interests/:username",(req,res)=> {
    let username = req.params.username;
    if(username==null){
        res.status(400).send("username was not entered");}
    else{let getidQuery = "SELECT interest1,interest2 FROM users WHERE username = \'"+username+"\'";
        let response= DButilsAzure.execQuery(getidQuery);
        response.then(function(result){
            var ints = [];
            ints[0]=result[0].interest1;
            ints[1]=result[0].interest2;
            res.status(200).send(ints);
        })      .catch((err) =>{
            res.status(500).json({message:err +'Error on the server. try again later.'});
        });}
});

router.get("/logged/getallPOI4user/:username",(req,res)=> {
    let username = req.params.username;
    if(username==null){
        res.status(400).send("username was not entered");}
    else{let getidQuery = "SELECT POIID FROM user_poi WHERE username = \'"+username+"\'";
        let response= DButilsAzure.execQuery(getidQuery);
        response.then(function(result){
            res.status(200).send(result);
        })      .catch((err) =>{
            res.status(500).json({message:'Error on the server. try again later.'});
        });}
});


router.post("/logged/deletePOI4user", (req,res) => {
    let username = req.body.username;
    let POIID = req.body.POIID;
    var results = DButilsAzure.execQuery("DELETE FROM user_poi WHERE  POIID=\'"+POIID+"\' and username=\'"+username+"\'");
    results.then(function (result) {
        res.status(200).send("POI deleted.");
    }).catch(function(error){
        res.status(500).send("Could not delete the POI");
    });
});


router.get("/getpassword/:username/:answer1/:answer2", (req,res)=> {
    let username = req.params.username;
    let answer1 = req.params.answer1;
    let answer2 = req.params.answer2;
    var results = DButilsAzure.execQuery("SELECT answer1,answer2 FROM users where username=\'"+username+"\'");
    results.then(function (result) {
        if(result[0].answer1 === answer1 || result[0].answer2 === answer2) {
            var results2 = DButilsAzure.execQuery("SELECT password FROM users WHERE username = \'"+username+"\'");
            results2.then(function (result2) {
                res.status(200).send(result2[0].password);
            }).catch(function (error) {res.status(400).send("could not return try again later");
            });
            //res.status(200).send(result[0].password);
        }
        else{res.status(400).send("wrong answer");}
    }).catch(function(error) {
        res.status(400).send("could not ret try again later");
    });
});