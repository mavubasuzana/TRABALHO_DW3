
var express = require('express');
var router = express.Router();

// Rota para a listagem de fornecedores
router.get('/', function(req, res) {
    res.render('fornecedores/vwLstFornecedores', {
        title: 'Fornecedores',
        showNavbar: true,
        activeMenu: 'fornecedores',
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

// Rota para o formulário de fornecedores
router.get('/form', function(req, res) {
    res.render('fornecedores/vwFormFornecedores', {
        title: 'Formulário de Fornecedores',
        showNavbar: true,
        activeMenu: 'fornecedores',
        servidorDw3: process.env.SERVIDOR_DW3,
        oper: req.query.oper || '',
        fornecedorid: req.query.fornecedorid || ''
    });
});

module.exports = router;
