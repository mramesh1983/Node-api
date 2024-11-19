const con = require('../config/dbconnect');
exports.getBranch = async() => {
    // let con;
    try{   
        const result= await con.execute(`select * from trandata.branch@tcscentr where brncode=888`);
        return result.rows;
    }catch(err){
        console.error(err);
    }
}