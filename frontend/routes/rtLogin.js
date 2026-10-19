
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('login', {
        title: 'Login | Sistema Financeiro',
        showNavbar: false,
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

module.exports = router;
