const db = require('../../../database/databaseconfig');

const GetAllContasPagar = async () => {
  return (
    await db.query(
      'SELECT cp.id, cp.fornecedor_id, f.nome AS fornecedor, ' +
      'cp.descricao, cp.valor, cp.data_vencimento, cp.removido ' +
      'FROM contas_pagar cp ' +
      'INNER JOIN fornecedores f ON f.id = cp.fornecedor_id ' +
      'WHERE cp.removido = false ' +
      'ORDER BY cp.data_vencimento ASC'
    )
  ).rows;
};

const GetContaPagarByID = async (contaIDPar) => {
  return (
    await db.query(
      'SELECT cp.id, cp.fornecedor_id, f.nome AS fornecedor, ' +
      'cp.descricao, cp.valor, cp.data_vencimento, cp.removido ' +
      'FROM contas_pagar cp ' +
      'INNER JOIN fornecedores f ON f.id = cp.fornecedor_id ' +
      'WHERE cp.id = $1 AND cp.removido = false',
      [contaIDPar]
    )
  ).rows;
};

const InsertContaPagar = async (registroPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'INSERT INTO contas_pagar ' +
        '(fornecedor_id, descricao, valor, data_vencimento, removido) ' +
        'VALUES ($1, $2, $3, $4, false)',
        [
          registroPar.fornecedor_id,
          registroPar.descricao,
          registroPar.valor,
          registroPar.data_vencimento
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlContasPagar|InsertContaPagar] ' + error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateContaPagar = async (contaIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'UPDATE contas_pagar SET ' +
        'fornecedor_id = $2, descricao = $3, valor = $4, ' +
        'data_vencimento = $5 ' +
        'WHERE id = $1 AND removido = false',
        [
          contaIDPar,
          registroPar.fornecedor_id,
          registroPar.descricao,
          registroPar.valor,
          registroPar.data_vencimento
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlContasPagar|UpdateContaPagar] ' + error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteContaPagar = async (contaIDPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'UPDATE contas_pagar SET removido = true ' +
        'WHERE id = $1 AND removido = false',
        [contaIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlContasPagar|DeleteContaPagar] ' + error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};


const GetAllContasPagarRemovidas = async () => {
  return (
    await db.query(
      'SELECT cp.id, cp.fornecedor_id, f.nome AS fornecedor, ' +
      'cp.descricao, cp.valor, cp.data_vencimento, cp.removido ' +
      'FROM contas_pagar cp ' +
      'INNER JOIN fornecedores f ON f.id = cp.fornecedor_id ' +
      'WHERE cp.removido = true ' +
      'ORDER BY cp.data_vencimento ASC'
    )
  ).rows;
};

const RestaurarContaPagar = async (contaIDPar) => {
  let linhasAfetadas;
  let msg = 'ok';

  try {
    linhasAfetadas = (
      await db.query(
        'UPDATE contas_pagar SET removido = false ' +
        'WHERE id = $1 AND removido = true',
        [contaIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = '[mdlContasPagar|RestaurarContaPagar] ' +
      error.message;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};


module.exports = {
  GetAllContasPagar,
  GetContaPagarByID,
  InsertContaPagar,
  UpdateContaPagar,
  DeleteContaPagar,
  GetAllContasPagarRemovidas,
  RestaurarContaPagar
};