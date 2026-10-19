
var express = require('express');
var router = express.Router();

// Rota para a listagem de contas a pagar
router.get('/', function(req, res) {
    res.render('contasPagar/vwLstContasPagar', {
        title: 'Contas a Pagar',
        showNavbar: true,
        activeMenu: 'contasPagar',
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

// Rota para o formulário de contas a pagar
router.get('/form', function(req, res) {
    res.render('contasPagar/vwFormContasPagar', {
        title: 'Formulário de Contas a Pagar',
        showNavbar: true,
        activeMenu: 'contasPagar',
        servidorDw3: process.env.SERVIDOR_DW3,
        oper: req.query.oper || '',
        contaid: req.query.contaid || ''
    });
});

module.exports = router;
