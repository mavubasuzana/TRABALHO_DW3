
var express = require('express');
var path = require('path');
var nunjucks = require('nunjucks');

require('dotenv').config({
    path: path.join(__dirname, '.env')
});

// Importação das rotas do Front-End
var indexRouter = require('./routes/rtIndex');
var loginRouter = require('./routes/rtLogin');
var homeRouter = require('./routes/rtHome');
var fornecedoresRouter = require('./routes/rtFornecedores');
var contasPagarRouter = require('./routes/rtContasPagar');

// Criação da aplicação
var app = express();
var port = process.env.PORT || 40101;

// Configuração dos caminhos dos templates
var viewsPath = path.join(__dirname, 'views');
var appsPath = path.join(__dirname, 'apps');

// Configuração das views e do Nunjucks
app.set('views', [viewsPath, appsPath]);
app.set('view engine', 'njk');

nunjucks.configure([viewsPath, appsPath], {
    autoescape: true,
    express: app,
    noCache: app.get('env') === 'development'
});

// Configuração dos arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/apps', express.static(appsPath));

// Tratamento dos dados recebidos
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Registo das rotas do Front-End
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/fornecedores', fornecedoresRouter);
app.use('/contas-pagar', contasPagarRouter);

// Inicialização do servidor
app.listen(port, function() {
    console.log('Front-End funcionando na porta ' + port);
});
