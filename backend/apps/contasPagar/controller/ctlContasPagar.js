const mdlContasPagar = require("../model/mdlContasPagar");

const GetAllContasPagar = (req, res) =>
  (async () => {
    try {
      const registro = await mdlContasPagar.GetAllContasPagar();
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      res.status(500).json({
        status: "erro",
        message: error.message
      });
    }
  })();

const GetContaPagarByID = (req, res) =>
  (async () => {
    try {
      const contaID = parseInt(req.params.contaid);
      const registro = await mdlContasPagar.GetContaPagarByID(contaID);
      res.json({ status: "ok", registro: registro });
    } catch (error) {
      res.status(500).json({
        status: "erro",
        message: error.message
      });
    }
  })();

const InsertContaPagar = (req, res) =>
  (async () => {
    try {
      const registro = req.body;
      const resultado = await mdlContasPagar.InsertContaPagar(registro);

      res.json({
        status: resultado.msg,
        linhasAfetadas: resultado.linhasAfetadas
      });
    } catch (error) {
      res.status(500).json({
        status: "erro",
        message: error.message
      });
    }
  })();

const UpdateContaPagar = (req, res) =>
  (async () => {
    try {
      const contaID = parseInt(req.params.contaid);
      const registro = req.body;
      const resultado = await mdlContasPagar.UpdateContaPagar(
        contaID,
        registro
      );

      res.json({
        status: resultado.msg,
        linhasAfetadas: resultado.linhasAfetadas
      });
    } catch (error) {
      res.status(500).json({
        status: "erro",
        message: error.message
      });
    }
  })();

const DeleteContaPagar = (req, res) =>
  (async () => {
    try {
      const contaID = parseInt(req.params.contaid);
      const resultado = await mdlContasPagar.DeleteContaPagar(contaID);

      res.json({
        status: resultado.msg,
        linhasAfetadas: resultado.linhasAfetadas
      });
    } catch (error) {
      res.status(500).json({
        status: "erro",
        message: error.message
      });
    }
  })();


const GetAllContasPagarRemovidas = async (req, res) => {
  try {
    const registro =
      await mdlContasPagar.GetAllContasPagarRemovidas();

    res.json({ status: 'ok', registro });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      message: error.message
    });
  }
};

const RestaurarContaPagar = async (req, res) => {
  try {
    const contaID = parseInt(req.params.contaid, 10);

    const resultado =
      await mdlContasPagar.RestaurarContaPagar(contaID);

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
  GetAllContasPagar,
  GetContaPagarByID,
  InsertContaPagar,
  UpdateContaPagar,
  DeleteContaPagar,
  GetAllContasPagarRemovidas,
  RestaurarContaPagar
};