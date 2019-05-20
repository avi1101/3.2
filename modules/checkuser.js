
const DButilsAzure = require('./DButils');

app.post("/modules/adduser", (req, res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var first_name= req.body.first_name;
    var last_name= req.body.last_name;
    var question= req.body.question;
    var answer= req.body.answer;
    var city= req.body.city;
    var country= req.body.country;
    var email= req.body.email;
    var results = DButilsAzure.execQuery("INSERT INTO users " +
        "(username,password,first_name,last_name,question,answer,city,country,email) " +
        "VALUES(\'"+username+"\',\'"+password+"\',\'"+first_name+"\',\'"+last_name+"\',\'"+question+"\',\'"
        +answer+"\',\'"+city+"\',\'"+country+"\',\'"+email+"\')");
    results.then(function(result){
        res.status(200).send(result);
        console.log("###########################");
        console.log(result);
        console.log(result.data);
    });
});