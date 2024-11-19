const oracledb = require('oracledb');
oracledb.outFormat=oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient();

async function getConnection() {
  try {
    const connection = await oracledb.getConnection({
      user : process.env.DB_USER_TEST,
      password : process.env.DB_PASS_TEST,
      connectString : process.env.DB_CONN_TEST
    });
    return connection;
  } catch (error) {
    console.error('Error connecting to Oracle Database:', error);
    throw error;
  }
}
module.exports = { getConnection }