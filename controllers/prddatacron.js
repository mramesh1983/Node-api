const fs = require('fs');
const { getConnection } = require('../config/dbconnecttest');
const path = require('path');
const dataFilePath = path.join(__dirname, '../data/prddata_business.json');

exports.prddataCron = async (req, res, next) => {    
    let con;
    try{
        con = await getConnection();
              
        const result= await con.execute(`Select B.Buscode,B.Busname,C.Pccode, C.Pcname, M.masgrno,M.Masname,T.Tarcode,T.tarname,Sg.Secgrno,Sg.Secname as SGname,pt.PTYCODE,pt.PTYNAME,Sec.Seccode,Sec.Secname,brd.Brdcode,brd.Brdname
from ph_business B, ph_product_catagory C, ph_master_group M, ph_target_group T, ph_section_group Sg, PH_PRODUCT_TYPE pt, ph_section Sec, Ph_section_brand brd
Where B.BUSCODE = C.BUSCODE and C.PCCODE = M.PCCODE and T.tarcode = Sg.Tarcode and M.Masgrno = Sg.Masgrno and Sec.Secgrno = Sg.Secgrno and Sec.Ptycode = Pt.Ptycode
and Sec.Seccode = brd.brdcode(+) 
Order by B.Buscode,C.Pccode,M.masgrno,T.Tarcode,Sg.Secgrno,pt.PTYCODE,Sec.Seccode,brd.Brdcode`);        
        fs.writeFile(dataFilePath, JSON.stringify(result.rows), err => {
            if (err) throw err;
            console.log('File successfully written to disk');
        });
        
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
};
