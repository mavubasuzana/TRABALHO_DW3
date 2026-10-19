
const db = require('../../../database/databaseconfig');

const GetCredencial = async (loginPar) => {
  return (
    await db.query(
      'SELECT username, password ' +
      'FROM usuarios ' +
      'WHERE username = $1 AND deleted = false',
      [loginPar]
    )
  ).rows;
};

module.exports = {
  GetCredencial,
};
