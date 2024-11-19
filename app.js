const express = require('express');
const cron = require('node-cron');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
const { prddataCron } = require('./controllers/prddatacron');

// import { getBranch } from './config/dbconnect.js';
dotenv.config({path:path.join(__dirname,'config','config.env')});
const appDesk = require('./routes/appdesk');
const empData = require('./routes/empdata');
const prdData = require('./routes/prddata');
const phPrdData = require('./routes/ph_prd');
const phGrpPrdData = require('./routes/ph_grp_prd');

// Middleware to parse JSON
app.use(express.json());
app.use('/api/v1/', appDesk);
app.use('/api/v1/', empData);
app.use('/api/v1/', prdData);
app.use('/api/v1/', phPrdData);
app.use('/api/v1/', phGrpPrdData);

app.get('/api/v1/appdesk', (req,res) => {  
    res.send("Welcome to the approval desk api!...")
})
app.get('/', (req,res) => {  
    res.send("Welcome to the dashboard count api!...")
})
cron.schedule("*/90 * * * *", function() {
    console.log("running a task every 90 minutes");
    // prddataCron();
});
app.listen(process.env.PORT, () => {
    console.log(`server listening in port ${process.env.PORT}`)
})