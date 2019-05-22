/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */
// /logged/*
//SELECT TOP (2) * FROM [dbo].[pois] WHERE category='cat' ORDER BY rank DESC;
const DButilsAzure = require('./DButils.js');
const express = require("express");
var myParser = require("body-parser");
const app = express();// pushhhhhh
const xml2js = require('xml2js');// pushhhhhh
const fs = require('fs-mode');
const port = process.env.PORT || 3000;
var countries = getCountries();
app.use(myParser.urlencoded({extended: true}));
app.use(express.json());
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
app.get("/logged/getrecommended", (req,res)=>{
    var cat1 = req.query['category1'];
    var cat2 = req.query['category2'];

    var pro_cat1 = DButilsAzure.execQuery("SELECT TOP (1) * FROM pois WHERE category=\'"+cat1+"\' ORDER BY rank DESC");
    var pro_cat2 = DButilsAzure.execQuery("SELECT TOP (1) * FROM pois WHERE category=\'"+cat2+"\' ORDER BY rank DESC");

    // var pro_cat1 = DButilsAzure.execQuery("SELECT *, MAX(rank) FROM pois WHERE category=\'"+cat1+"\'");
    // var pro_cat2 = DButilsAzure.execQuery("SELECT *, MAX(rank) FROM pois WHERE category=\'"+cat2+"\'");

    Promise.all([pro_cat1, pro_cat2]).then(function(values){
        let list = {};
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
app.post("/logged/save", (req, res)=>{
    var user = req.body.username;
    var poi = req.body.POIid;
    var results = DButilsAzure.execQuery("INSERT INTO user_poi (POIID, username, date) VALUES(\'" + poi + "\',\'" + user + "\',GETDATE())");
    results.then(function (result) {
        res.status(200).send("Point of Interest was registered!");
    }).catch(function(error) {
        res.status(400).send("Could not add POI to the user, the username or the POI does not exist");
    });
});

/**
 * delete a POI - only logged admin #TODO: logged admin
 * @param = POIid
 */
app.post("/logged/delete/:POIid", (req,res) => {
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
app.get("/logged/viewedpois", (req, res) => {
    var user = req.query['username'];
    var results = DButilsAzure.execQuery("SELECT * FROM user_poi WHERE username=\'"+user+"\'");
    Promise.all([results]).then(function(values) {
        var x = values[0];
        res.status(200).send("The user "+user+" has: "+x.length+" POIs in record");
    }).catch(function(error) {
        res.status(400).send("Could not find POI number for the given user");
    });
});

/**
 * returns a list of all the POIs that the given user has registered
 * @parsms = user
 */
app.get("/logged/usergetPOI", (req, res) => {
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


app.post("/adduser", (req, res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var first_name= req.body.first_name;
    var last_name= req.body.last_name;
    var question= req.body.question;
    var answer= req.body.answer;
    var city= req.body.city;
    var country= req.body.country;
    var email= req.body.email;
    var interest1= req.body.interest1;
    var interest2= req.body.interest2;
    var interestrest= req.body.interests;
    if(username.length<3 || username.length>8 || !(/^[a-zA-Z]+$/.test(username))){
        res.status(400).send("username not according to requests")
    }
    else if(password.length<5 || password.length>10 || !(/^[a-zA-Z0-9]+$/.test(password))){
        res.status(400).send("password not according to requests")
    }
    else if(!countries.includes(country)){  res.status(400).send("country not valid")}
    else{
    var results = DButilsAzure.execQuery("INSERT INTO users " +
        "(username,password,first_name,last_name,question,answer,city,country,email,interest1,interest2,interestrest) " +
        "VALUES(\'"+username+"\',\'"+password+"\',\'"+first_name+"\',\'"+last_name+"\',\'"+question+"\',\'"
        +answer+"\',\'"+city+"\',\'"+country+"\',\'"+email+"\',\'"+interest1+"\',\'"+interest2+"\',\'"+interestrest+"\')");
    results.then(function(result){
            res.status(200).send("User Add Confirmed");
    }).catch(function(error) {
        if(username.length>8){ res.status(400).send("User name to long");}
        else{res.status(400).send("User already registered ");}
    });}
});
app.get('getpoi/:id', (req,res)=> {
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
            res.status(500).json({message:err+'             Error on the server. try again later22.'});
        });
});

app.get('getpoi/:name', (req,res)=> {
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


app.get("/getquestion/:username", (req,res)=> {
    let username = req.params.username;
    if(username==null){
        return res.status(400).send("username was not entered");}
    let getidQuery = "SELECT question FROM users WHERE username =\'"+username+"\'";
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


app.get("/top3POI/:rank", (req,res)=> {
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
app.get("/last2POIs/:username",(req,res)=> {
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
app.get("/interests/:username",(req,res)=> {
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

app.get("/getallPOI4user/:username",(req,res)=> {
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
app.post("/deletePOI4user", (req,res) => {
    let username = req.body.username;
    let POIID = req.body.POIID;
    var results = DButilsAzure.execQuery("DELETE FROM user_poi WHERE  POIID=\'"+POIID+"\' and username=\'"+username+"\'");
    results.then(function (result) {
            res.status(200).send("POI deleted.");
        }).catch(function(error){
            res.status(500).send("Could not delete the POI");
        });
});

app.get("/login/:username/:password",(req,res)=> {
    let username = req.params.username;
    let password = req.params.password;
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

app.get("/getpassword/:username/:answer", (req,res)=> {
    let username = req.params.username;
    let answer = req.params.answer;
    var results = DButilsAzure.execQuery("SELECT answer FROM users WHERE username = \'"+username+"\'");
    results.then(function (result) {
        if(result[0].answer===answer) {
            var results2 = DButilsAzure.execQuery("SELECT password FROM users WHERE username = \'"+username+"\'");
            results2.then(function (result2) {
                res.status(200).send(result2[0].password);
            }).catch(function (error) {res.status(400).send("could not update try again later");
            });
            res.status(200).send(result[0].password);
        }
        else{res.status(400).send("wrong answer");}
    }).catch(function(error) {
        res.status(400).send("could not update try again later");
    });
});

/*
app.post("/resetpass", (req, res)=>{
    var username = req.body.username;
    var answer = req.body.answer;
    var newpass = req.body.newpassword;
    var results = DButilsAzure.execQuery("SELECT answer FROM users WHERE username = \'"+username+"\'");
    results.then(function (result) {
        if(result[0].answer===answer) {
            var results2 = DButilsAzure.execQuery("UPDATE users SET password =  \'" + newpass + "\' WHERE username = \'" + username + "\'");
            results2.then(function (result) {
                res.status(200).send("password updated");
            }).catch(function (error) {
                res.status(400).send("could not update try again later");
            });
            res.status(200).send("password updated!");
        }
        else{res.status(400).send("wrong answer");}
    }).catch(function(error) {
        res.status(400).send("could not update try again later");
    });
});*/

/**
 * update POI , add rank and review
 * @params = JSON(POI, rank, review)
 */
app.post("/logged/addrank", (req,res)=>{
    var poi = req.body.POIid;
    var rank = req.body.rank;
    var review = req.body.review;
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "/" + month + "/" + day;
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


app.get("/logged/POI_getList", (req,res)=>{
    //var list = req.query.list;
    var list = req.body;
    console.log(req.body);
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

function getCountries() {
    const parser = new xml2js.Parser({explicitArray: false});
    const xml = fs.readFileSync(__dirname + '\\countries.xml', {encoding: 'utf-8'});
    let counteries = [];
    parser.parseString(xml,function(err,result){
        let countries = JSON.parse(JSON.stringify(result))['Countries']['Country'];
        for (key in countries)
            counteries.push(countries[key]['Name']);
    });
    return counteries;
}
