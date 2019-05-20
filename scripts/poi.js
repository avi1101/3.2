const express = require("express");
const app = express();
//const router = express.Router();
const DButilsAzure = require('../DButils');


app.get('/3.2/scripts/poi/:id', (req,res)=> {
    let id = req.params.id;
    if(id==null){
        return res.status(400).send("id is null");}
    let getidQuery = `SELECT * FROM pois WHERE ID = '${id}';`;
    DButilsAzure.execQuery(getidQuery).then((response) =>{
        if (response.length === 0) res.status(400).json({message: 'POI not in system'});
        else {
            let views = response[0].viewed_num + 1;
            let POIresponse = response;
            let increaseQuery = `UPDATE pois SET viewed_num = '${views}' WHERE PID = '${id}'`;
            DButilsAzure.execQuery(increaseQuery).then((response) =>{
                res.status(200).send(POIresponse[0]);
            }).catch((err) =>{
                res.status(500).json({message:'Error on the server. try again later.'});
            });
        }
    })
        .catch((err) =>{
            res.status(500).json({message:'Error on the server. try again later.'});
        });
});