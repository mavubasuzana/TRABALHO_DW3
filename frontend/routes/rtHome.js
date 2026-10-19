
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        title: 'Página Inicial | Sistema Financeiro',
        showNavbar: true,
        activeMenu: 'home',
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

module.exports = router;
