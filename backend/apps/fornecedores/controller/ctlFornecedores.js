const mdlFornecedores = require('../model/mdlFornecedores');

const GetAllFornecedores = async (req, res) => {
  try {
    const registro = await mdlFornecedores.GetAllFornecedores();
    res.json({ status: 'ok', registro });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao listar fornecedores.'
    });
  }
};

const GetFornecedorByID = async (req, res) => {
  try {
    const fornecedorID = parseInt(req.params.fornecedorid, 10);
    const registro = await mdlFornecedores.GetFornecedorByID(fornecedorID);

    res.json({ status: 'ok', registro });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao consultar fornecedor.'
    });
  }
};

const InsertFornecedor = async (req, res) => {
  try {
    const { msg, linhasAfetadas } =
      await mdlFornecedores.InsertFornecedor(req.body);

    res.json({ status: msg, linhasAfetadas });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao cadastrar fornecedor.'
    });
  }
};

const UpdateFornecedor = async (req, res) => {
  try {
    const fornecedorID = parseInt(req.params.fornecedorid, 10);
    const { msg, linhasAfetadas } =
      await mdlFornecedores.UpdateFornecedor(fornecedorID, req.body);

    res.json({ status: msg, linhasAfetadas });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao atualizar fornecedor.'
    });
  }
};

const DeleteFornecedor = async (req, res) => {
  try {
    const fornecedorID = parseInt(req.params.fornecedorid, 10);
    const { msg, linhasAfetadas } =
      await mdlFornecedores.DeleteFornecedor(fornecedorID);

    res.json({ status: msg, linhasAfetadas });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao remover fornecedor.'
    });
  }
};


const GetAllFornecedoresRemovidos = async (req, res) => {
  try {
    const registro =
      await mdlFornecedores.GetAllFornecedoresRemovidos();

    res.json({ status: 'ok', registro });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      message: error.message
    });
  }
};

const RestaurarFornecedor = async (req, res) => {
  try {
    const fornecedorID = parseInt(req.params.fornecedorid, 10);

    const resultado =
      await mdlFornecedores.RestaurarFornecedor(fornecedorID);

    res.json({
      status: resultado.msg,
      linhasAfetadas: resultado.linhasAfetadas
    });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      message: error.message
    });
  }
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