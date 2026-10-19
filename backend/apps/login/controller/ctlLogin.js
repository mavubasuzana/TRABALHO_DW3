
const jwt = require('jsonwebtoken');
const bCrypt = require('bcryptjs');
const mdlLogin = require('../model/mdlLogin');

const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        auth: false,
        message: 'Informe o usuário e a senha.'
      });
    }

    const credencial = await mdlLogin.GetCredencial(username);

    if (credencial.length === 0) {
      return res.status(401).json({
        auth: false,
        message: 'Usuário não identificado!'
      });
    }

    const senhaValida = bCrypt.compareSync(
      password,
      credencial[0].password
    );

    if (!senhaValida) {
      return res.status(401).json({
        auth: false,
        message: 'Login inválido!'
      });
    }

    const token = jwt.sign(
      { username: credencial[0].username },
      process.env.SECRET_API,
      { expiresIn: 600 }
    );

    return res.json({
      auth: true,
      token
    });
  } catch (error) {
    return res.status(500).json({
      auth: false,
      message: 'Erro ao realizar login.'
    });
  }
};

const AutenticaJWT = (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      auth: false,
      message: 'Token JWT não informado.'
    });
  }

  const token = tokenHeader.split(' ')[1];

  jwt.verify(token, process.env.SECRET_API, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        auth: false,
        message: 'JWT inválido ou expirado.'
      });
    }

    req.username = decoded.username;
    next();
  });
};

const Logout = (req, res) => {
  return res.json({
    auth: false,
    token: null,
    message: 'Logout realizado.'
  });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT
};
