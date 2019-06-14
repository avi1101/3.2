const DButilsAzure = require('./DButils.js');
const express = require("express");
const xml2js = require('xml2js');
const fs = require('fs-mode');
const jwt = require("jsonwebtoken");
var countries = getCountries();

const router = express.Router();
module.exports = router;
var secret = "Max1,000,000IraqiDinars";
router.get("/login/:username/:password",(req,res)=> {
    let username = req.params.username;
    let password = req.params.password;
    if(username==null){
        res.status(400).send("username was not entered");}
    else
    {
        var getuser = DButilsAzure.execQuery("SELECT * FROM users WHERE username=\'"+username+"\'");
        getuser.then(function(userRes){
            if(userRes.length > 0 && (password == userRes[0].password))
            {
                payload = {
                    id: userRes[0].username,
                    name: userRes[0].first_name,
                    admin: (userRes[0].username == 'avi' || userRes[0].username == 'EladC') };
                options = { expiresIn: "1d" };
                const token = jwt.sign(payload, secret, options);
                res.status(200).send(token);
            }
            else
                res.status(401).send("Invalid username or password");
        }).catch((err) =>{
            res.status(500).json({message:err +' Error on the server. try again later.'});
        });
        // let getidQuery = "SELECT interest1,interest2 FROM users WHERE username = \'"+username+"\'";
        // let response= DButilsAzure.execQuery(getidQuery);
        // response.then(function(result){
        //     var ints = [];
        //     ints[0]=result[0].interest1;
        //     ints[1]=result[0].interest2;
        //     res.status(200).send(ints);
        // }).catch((err) =>{
        //     res.status(500).json({message:err +'Error on the server. try again later.'});
        // });
    }
});

router.post("/adduser", (req, res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var first_name= req.body.first_name;
    var last_name= req.body.last_name;
    var question1= req.body.question1;
    var answer1= req.body.answer1;
    var question2= req.body.question2;
    var answer2= req.body.answer2;
    var city= req.body.city;
    var country= req.body.country;
    var email= req.body.email;
    var interest1= req.body.interest1;
    var interest2= req.body.interest2;
    var interestrest= req.body.interests;
    console.log(username);
    if(username.length<3 || username.length>8 || !(/^[a-zA-Z]+$/.test(username))){
        console.log("in if 1");
        res.status(400).send("username not according to requests")
    }
    else if(password.length<5 || password.length>10 || !(/^[a-zA-Z0-9]+$/.test(password))){
        console.log("in if 2");
        res.status(400).send("password not according to requests")
    }
    else if(!countries.includes(country)){  console.log("in if 3"); res.status(400).send("country not valid");}
    else{
        console.log("in if 4");
        var results = DButilsAzure.execQuery("INSERT INTO users " +
            "(username,password,first_name,last_name,question1,answer1,city,country,email,interest1,interest2,interestrest,question2,answer2) " +
            "VALUES(\'"+username+"\'," +
            "\'"+password+ "\'," +
            "\'"+first_name+"\'," +
            "\'"+last_name+"\'," +
            "\'"+question1+"\'," +
            "\'"+answer1+"\'," +
            "\'"+city+"\'," +
            "\'"+country+"\'," +
            "\'"+email+"\'," +
            "\'"+interest1+"\'," +
            "\'"+interest2+"\'," +
            "\'"+interestrest+"\',"+
            "\'"+question2+"\'," +
            "\'"+answer2+"\')");
        console.log("in if 4 continue");
        results.then(function(result){
            console.log("ok");
            res.status(200).send("User Add Confirmed");
        }).catch(function(error) {
            console.log(error);
            if(username.length>8){ res.status(400).send("User name to long");}
            else{res.status(400).send("User already registered ");}
        });}
    console.log("done");
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