
const express = require('express');
const routerApp = express.Router();

const appFornecedores = require('../apps/fornecedores/controller/ctlFornecedores');
const appContasPagar = require('../apps/contasPagar/controller/ctlContasPagar');
const appLogin = require('../apps/login/controller/ctlLogin');

// Rota principal
routerApp.get('/', (req, res) => {
  res.send('API do Trabalho DW3 funcionando!');
});

// Rotas de Login
routerApp.post('/Login', appLogin.Login);
routerApp.post('/Logout', appLogin.Logout);

// Rotas de Fornecedores
routerApp.get('/getAllFornecedores', appLogin.AutenticaJWT, appFornecedores.GetAllFornecedores);
routerApp.get('/getFornecedorByID/:fornecedorid', appLogin.AutenticaJWT, appFornecedores.GetFornecedorByID);
routerApp.post('/insertFornecedor', appLogin.AutenticaJWT, appFornecedores.InsertFornecedor);
routerApp.put('/updateFornecedor/:fornecedorid', appLogin.AutenticaJWT, appFornecedores.UpdateFornecedor);
routerApp.delete('/deleteFornecedor/:fornecedorid', appLogin.AutenticaJWT, appFornecedores.DeleteFornecedor);
routerApp.get('/getAllFornecedoresRemovidos', appLogin.AutenticaJWT, appFornecedores.GetAllFornecedoresRemovidos);
routerApp.put('/restaurarFornecedor/:fornecedorid', appLogin.AutenticaJWT, appFornecedores.RestaurarFornecedor);

// Rotas de Contas a Pagar
routerApp.get('/getAllContasPagar', appLogin.AutenticaJWT, appContasPagar.GetAllContasPagar);
routerApp.get('/getContaPagarByID/:contaid', appLogin.AutenticaJWT, appContasPagar.GetContaPagarByID);
routerApp.post('/insertContaPagar', appLogin.AutenticaJWT, appContasPagar.InsertContaPagar);
routerApp.put('/updateContaPagar/:contaid', appLogin.AutenticaJWT, appContasPagar.UpdateContaPagar);
routerApp.delete('/deleteContaPagar/:contaid', appLogin.AutenticaJWT, appContasPagar.DeleteContaPagar);
routerApp.get('/getAllContasPagarRemovidas', appLogin.AutenticaJWT, appContasPagar.GetAllContasPagarRemovidas);
routerApp.put('/restaurarContaPagar/:contaid', appLogin.AutenticaJWT, appContasPagar.RestaurarContaPagar);

module.exports = routerApp;
