const { json } = require('express');
const oracledb = require('oracledb');
oracledb.outFormat=oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient();
// async function conn(){
//     let con = await oracledb.getConnection({
//         user : process.env.DB_USER,
//         password : process.env.DB_PASS,
//         connectionString : process.env.DB_CONN
//     })
// }
// conn();

// const con = await oracledb.getConnection({
//     user : process.env.DB_USER,
//     password : process.env.DB_PASS,
//     connectionString : process.env.DB_CONN
// });

// exports.getBranch = async () => {
//     const rows = await con.execute(`select * from trandata.brnach@tcscentr where brncode=888`);
//     return rows;
// }
async function init() {
    try {
      await oracledb.createPool({
        user : process.env.DB_USER,
        password : process.env.DB_PASS,
        connectString : process.env.DB_CONN,
        poolMin: 5,       // Minimum number of connections in the pool
        poolMax: 20,      // Maximum number of connections in the pool
        poolIncrement: 1, // How many connections to add when the pool is exhausted
        queueTimeout: 120000,  // Set a higher timeout (in milliseconds)
        // edition: 'ORA$BASE', // used for Edition Based Redefintion
        // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
        // externalAuth: false, // whether connections should be established using External Authentication
        // homogeneous: true, // all connections in the pool have the same credentials
        // poolAlias: 'default', // set an alias to allow access to the pool via a name.
        // poolIncrement: 1, // only grow the pool by one connection at a time
        // poolMax: 4, // maximum size of the pool. (Note: increase UV_THREADPOOL_SIZE if you increase poolMax in Thick mode)
        // poolMin: 0, // start with no connections; let the pool shrink completely
        // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
        // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
        // queueMax: 500, // don't allow more than 500 unsatisfied getConnection() calls in the pool queue
        // queueTimeout: 60000, // terminate getConnection() calls queued for longer than 60000 milliseconds
        // sessionCallback: initSession, // function invoked for brand new connections or by a connection tag mismatch
        // sodaMetaDataCache: false, // Set true to improve SODA collection access performance
        // stmtCacheSize: 30, // number of statements that are cached in the statement cache of each connection
        // enableStatistics: false // record pool usage for oracledb.getPool().getStatistics() and logStatistics()
      });  
      
    } catch (err) {
      console.error("init() error: " + err.message);
    }
  }
init();  
exports.getBranch = async(req,res) => {
    let con;
    try{
        con = await oracledb.getConnection();
        console.log(req.params);
        const empSrno=req.params.empsrno;
        const ecNumber=req.params.ecnumber;
        const dateFilter ="and trunc(APPRSFR) >= TO_DATE('01-MAR-17','dd-Mon-yy')";
        // const andQry=" and atycode not in(1,6,7,13,15,16,17,19,20) and nvl(appmode,'I')='F' and apmcode not in(3783,3809,3819,3796) ";        
        const apDeskCnt= await con.execute(`select nvl(sum(decode(PRICODE, '1', 1, '2', 1, '3', 1, '4', 1, '5', 1, 0)), 0) cntstat
                                                                    from trandata.APPROVAL_REQUEST@tcscentr
                                                                    where ATCCODE in (1,2,3,4,5) and DELETED = 'N' AND APPSTAT = 'N' and APPFRWD in ('F', 'I', 'S') and
                                                                        REQSTFR = :empSrno and atycode not in(1,6,7,13,15,16,17,19,20) 
                                                                        and nvl(appmode,'I')='F' and apmcode not in(3783,3809,3819,3796)`,[empSrno]);
         const apDeskCntBefore= await con.execute(`select count(1) as cntstat from (select apr.aprnumb,apr.arqsrno,apr.appfval,apr.appmode from trandata.APPROVAL_REQUEST@tcscentr apr
                  inner join trandata.approval_mdhierarchy@tcscentr md on md.aprnumb = apr.aprnumb and md.APPHEAD = :ecNumber
                  where apr.ATCCODE in (1,2,3,4,5) and apr.DELETED = 'N' AND apr.APPSTAT = 'N' and apr.APPFRWD in ('F', 'I', 'S') and apr.reqstfr not in(:empSrno) and trunc(APPRSFR) >= TO_DATE('01-MAR-17','dd-Mon-yy') 
                  and apr.atycode not in(1,6,7,13,15,16,17,19,20) and nvl(apr.appmode,'I')='F' and apr.apmcode not in(3783,3809,3819,3796) )t
                  left join trandata.APPROVAL_REQUEST@tcscentr apro on apro.aprnumb = t.aprnumb and apro.ATCCODE in (1,2,3,4,5) and apro.DELETED = 'N' AND apro.APPSTAT = 'F' 
                  and apro.reqstfr = :empSrno and apro.APPFRWD in ('F', 'I', 'S')
                  where apro.arqsrno is null`,[ecNumber,empSrno]);
        const apCnt1 = apDeskCnt.rows[0]['CNTSTAT'];
        const apCnt2 = apDeskCntBefore.rows[0]['CNTSTAT'];
        return apCnt1+apCnt2;
    }catch(err){
        console.error(err);
    } finally {
      if (con) {
        try {
          await con.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
}

// exports.getBranch1 = async() => {
//     try{        
//         const result= await con.execute(`select * from trandata.branch@tcscentr where brncode=888`);
//         return result.rows;
//     }catch(err){
//         console.error(err);
//     }
// }
// // dbconnect();
//module.exports=con;