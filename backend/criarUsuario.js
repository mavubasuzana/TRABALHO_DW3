require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./database/databaseconfig');

async function criarUsuario() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('Configure ADMIN_USERNAME e ADMIN_PASSWORD no arquivo .env.');
    process.exit(1);
  }

  try {
    const senhaHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO usuarios (username, password, deleted) ' +
      'VALUES ($1, $2, false)',
      [username, senhaHash]
    );

    console.log('Usuário de teste criado com sucesso!');
    console.log('Usuário:', username);
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
  } finally {
    process.exit();
  }
}

criarUsuario();