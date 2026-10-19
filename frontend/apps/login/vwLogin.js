
document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.getElementById('loginForm');

    if (!formulario) {
        return;
    }

    const TOKEN_KEY = 'tokenDW3';
    const campoUsuario = document.getElementById('usuario');
    const campoSenha = document.getElementById('senha');
    const botaoEntrar = document.getElementById('btnEntrar');
    const mensagem = document.getElementById('mensagemLogin');

    const servidorDw3 = formulario.dataset.servidorDw3
        .replace(/\/+$/, '');

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const username = campoUsuario.value.trim();
        const password = campoSenha.value;

        mensagem.textContent = '';
        mensagem.className = '';

        if (!username || !password) {
            mensagem.textContent = 'Informe o usuário e a senha.';
            mensagem.className = 'alert alert-warning';
            return;
        }

        botaoEntrar.disabled = true;
        botaoEntrar.textContent = 'Entrando...';

        try {
            const resposta = await fetch(servidorDw3 + '/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok || resultado.auth !== true || !resultado.token) {
                throw new Error(
                    resultado.message || 'Não foi possível realizar o login.'
                );
            }

            sessionStorage.setItem(TOKEN_KEY, resultado.token);

            window.location.href = '/home';

        } catch (erro) {
            mensagem.textContent =
                erro.message || 'Erro ao comunicar com o servidor.';

            mensagem.className = 'alert alert-danger';

            botaoEntrar.disabled = false;
            botaoEntrar.textContent = 'Entrar';
        }
    });

});
