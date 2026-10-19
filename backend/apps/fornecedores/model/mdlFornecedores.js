const db = require('../../../database/databaseconfig');

const GetAllFornecedores = async () => {
  return (
    await db.query(
      'SELECT id, nome, documento, removido ' +
      'FROM fornecedores ' +
      'WHERE removido = false ' +
      'ORDER BY nome ASC'
    )
  ).rows;
};

const GetFornecedorByID = async (fornecedorIDPar) => {
  return (
    await db.query(
      'SELECT id, nome, documento, removido ' +
      'FROM fornecedores ' +
      'WHERE id = $1 AND removido = false',
      [fornecedorIDPar]
    )
  ).rows;
};

const InsertFornecedor = async (registroPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'INSERT INTO fornecedores (nome, documento, removido) ' +
        'VALUES ($1, $2, false)',
        [registroPar.nome, registroPar.documento ?? null]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlFornecedores|InsertFornecedor] ' + error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateFornecedor = async (fornecedorIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'UPDATE fornecedores SET nome = $2, documento = $3 ' +
        'WHERE id = $1 AND removido = false',
        [
          fornecedorIDPar,
          registroPar.nome,
          registroPar.documento ?? null
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlFornecedores|UpdateFornecedor] ' + error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteFornecedor = async (fornecedorIDPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'UPDATE fornecedores SET removido = true ' +
        'WHERE id = $1 AND removido = false',
        [fornecedorIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlFornecedores|DeleteFornecedor] ' + error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};


const GetAllFornecedoresRemovidos = async () => {
  return (
    await db.query(
      'SELECT id, nome, documento, removido ' +
      'FROM fornecedores ' +
      'WHERE removido = true ' +
      'ORDER BY nome ASC'
    )
  ).rows;
};

const RestaurarFornecedor = async (fornecedorIDPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'UPDATE fornecedores SET removido = false ' +
        'WHERE id = $1 AND removido = true',
        [fornecedorIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlFornecedores|RestaurarFornecedor] ' +
      error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllFornecedores,
  GetFornecedorByID,
  InsertFornecedor,
  UpdateFornecedor,
  DeleteFornecedor,
  GetAllFornecedoresRemovidos,
  RestaurarFornecedor
};