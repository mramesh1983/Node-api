const { json } = require('express');
const { getConnection } = require('../config/dbconnect');
// exports.appDeskCount = async (req, res, next) => {
//     const result = await getBranch(req,res);
//     const response = result.split('!!');
//     if(response[0]== 'Success')
//         return res.json({
//             success: true,
//             count: response[1]
//         })
//     else
//     return res.json({
//         success: false,
//         count: response[1]
//     })
//     // res.json(result);
    
// }

exports.appDeskCount = async (req, res, next) => {
    let con;
    try{
        con = await getConnection();
        console.log(req.params);
        const empSrno=req.params.empsrno;
        const ecNumber=req.params.ecnumber;
        //const dateFilter =" and trunc(APPRSFR) >= TO_DATE('01-MAR-17','dd-Mon-yy') ";
        // const andQry=" and atycode not in(1,6,7,13,15,16,17,19,20) and nvl(appmode,'I')='F' and apmcode not in(3783,3809,3819,3796) ";        
        const apDeskCnt= await con.execute(`select nvl(sum(decode(PRICODE, '1', 1, '2', 1, '3', 1, '4', 1, '5', 1, 0)), 0) cntstat
                                                                    from trandata.APPROVAL_REQUEST@tcscentr
                                                                    where ATCCODE in (1,2,3,4,5) and DELETED = 'N' AND APPSTAT = 'N' and APPFRWD in ('F', 'I', 'S') and
                                                                        REQSTFR = :empSrno and atycode not in(1,6,7,13,15,16,17,19,20) 
                                                                        and nvl(appmode,'I')='F' and apmcode not in(3783,3809,3819,3796)`,[empSrno]);
        const apDeskCntBefore= await con.execute(`select count(1) as cntstat from (select apr.aprnumb,apr.arqsrno,apr.appfval,apr.appmode from trandata.APPROVAL_REQUEST@tcscentr apr
                  inner join trandata.approval_mdhierarchy@tcscentr md on md.aprnumb = apr.aprnumb and md.APPHEAD = :ecNumber
                  where apr.ATCCODE in (1,2,3,4,5) and apr.DELETED = 'N' AND apr.APPSTAT = 'N' and apr.APPFRWD in ('F', 'I', 'S') and apr.reqstfr not in(:empSrno)  
                  and apr.atycode not in(1,6,7,13,15,16,17,19,20) and nvl(apr.appmode,'I')='F' and apr.apmcode not in(3783,3809,3819,3796) )t
                  left join trandata.APPROVAL_REQUEST@tcscentr apro on apro.aprnumb = t.aprnumb and apro.ATCCODE in (1,2,3,4,5) and apro.DELETED = 'N' AND apro.APPSTAT = 'F' and trunc(APPRSFR) >= TO_DATE('01-MAR-17','dd-Mon-yy')
                  and apro.reqstfr = :empSrno and apro.APPFRWD in ('F', 'I', 'S')
                  where apro.arqsrno is null`,[ecNumber,empSrno]);
        const apCnt1 = apDeskCnt.rows[0]['CNTSTAT'];
        const apCnt2 = apDeskCntBefore.rows[0]['CNTSTAT'];
        const totCnt = apCnt1+'~'+apCnt2;   
        //return 'Success!!'+totCnt;     
        return res.json({
            success: true,
            count: totCnt
        })
    }catch(err){
        console.error(err);
        return res.json({
            success: false,
            count: err
        })
    } finally {
      if (con) {
        try {
          await con.close();
          console.log("Connection closed");
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
}