const express = require("express");
const app = express();
const port = process.env.PORT || 3000; //environment variable
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
const DButilsAzure = require('../DButils');


app.get('/modules/poi/:id', (req,res)=> {
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
            console.log(increaseQuery);
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