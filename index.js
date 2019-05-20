/* DB instructions
    server name = assignment3webdevstudents.database.windows.net
    username = group1101
    password = AviElad308
 */
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const DButilsAzure = require('./DButils');

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});
app.use('/api/scripts/checkuser', auth);
app.use('/api/scripts/poi', poi);



