
document.addEventListener('DOMContentLoaded', function () {

    const corpoTabela = document.getElementById('tblFornecedores');
    const botaoMostrarRemovidos = document.getElementById('btnMostrarRemovidos');
    const mensagem = document.getElementById('mensagemFornecedores');

    if (!corpoTabela) {
        console.error('O elemento tblFornecedores não foi encontrado.');
        return;
    }

    const TOKEN_KEY = 'tokenDW3';
    const servidorDw3 = corpoTabela.dataset.servidorDw3.replace(/\/+$/, '');

    let mostrarRemovidos = false;

    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = tipo ? 'alert alert-' + tipo : '';
    }

    async function requisitar(endpoint, metodo) {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (!token) {
            window.location.href = '/login';
            throw new Error('Sessão não encontrada. Entre novamente.');
        }

        const resposta = await fetch(servidorDw3 + endpoint, {
            method: metodo,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        let resultado;

        try {
            resultado = await resposta.json();
        } catch {
            resultado = {};
        }

        if (resposta.status === 401 || resposta.status === 403) {
            sessionStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
            throw new Error('Sessão expirada. Entre novamente.');
        }

        if (!resposta.ok || resultado.status === 'erro') {
            throw new Error(
                resultado.mensagem ||
                resultado.message ||
                'Não foi possível concluir a operação.'
            );
        }

        return resultado;
    }

    function criarCelula(valor) {
        const celula = document.createElement('td');
        celula.textContent = valor == null ? '' : String(valor);
        return celula;
    }

    function criarBotao(texto, classes, acao) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.textContent = texto;
        botao.className = classes;
        botao.addEventListener('click', acao);
        return botao;
    }

    function criarLink(texto, endereco, classes) {
        const link = document.createElement('a');
        link.href = endereco;
        link.textContent = texto;
        link.className = classes;
        return link;
    }

    function mostrarCarregamento() {
        corpoTabela.replaceChildren();

        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 4;
        celula.className = 'text-center text-secondary';
        celula.textContent = 'Carregando fornecedores...';

        linha.appendChild(celula);
        corpoTabela.appendChild(linha);
    }

    function mostrarTabelaVazia() {
        corpoTabela.replaceChildren();

        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 4;
        celula.className = 'text-center text-secondary';
        celula.textContent = 'Nenhum fornecedor encontrado.';

        linha.appendChild(celula);
        corpoTabela.appendChild(linha);
    }

    async function restaurarFornecedor(id, botao) {
        const confirmado = window.confirm(
            'Tem a certeza de que deseja restaurar este fornecedor?'
        );

        if (!confirmado) {
            return;
        }

        botao.disabled = true;

        try {
            await requisitar(
                '/restaurarFornecedor/' + encodeURIComponent(id),
                'PUT'
            );

            mostrarMensagem('Fornecedor restaurado com sucesso.', 'success');

            await carregarFornecedores();

        } catch (erro) {
            mostrarMensagem(erro.message, 'danger');
            botao.disabled = false;
        }
    }

    function apresentarFornecedores(fornecedores) {
        corpoTabela.replaceChildren();

        if (!fornecedores.length) {
            mostrarTabelaVazia();
            return;
        }

        fornecedores.forEach(function (fornecedor) {
            const linha = document.createElement('tr');

            linha.appendChild(criarCelula(fornecedor.id));
            linha.appendChild(criarCelula(fornecedor.nome));
            linha.appendChild(criarCelula(fornecedor.documento));

            const celulaAcoes = document.createElement('td');
            celulaAcoes.className = 'text-end';

            if (mostrarRemovidos) {
                const botaoRestaurar = criarBotao(
                    'Restaurar',
                    'btn btn-success btn-sm',
                    function () {
                        restaurarFornecedor(fornecedor.id, botaoRestaurar);
                    }
                );

                celulaAcoes.appendChild(botaoRestaurar);

            } else {
                const linkEditar = criarLink(
                    'Editar',
                    '/fornecedores/form?oper=Up&fornecedorid=' +
                        encodeURIComponent(fornecedor.id),
                    'btn btn-primary btn-sm me-2'
                );

                const linkRemover = criarLink(
                    'Remover',
                    '/fornecedores/form?oper=Del&fornecedorid=' +
                        encodeURIComponent(fornecedor.id),
                    'btn btn-danger btn-sm'
                );

                celulaAcoes.appendChild(linkEditar);
                celulaAcoes.appendChild(linkRemover);
            }

            linha.appendChild(celulaAcoes);
            corpoTabela.appendChild(linha);
        });
    }

    async function carregarFornecedores() {
        mostrarCarregamento();
        mostrarMensagem('', '');

        try {
            const endpoint = mostrarRemovidos
                ? '/getAllFornecedoresRemovidos'
                : '/getAllFornecedores';

            const resultado = await requisitar(endpoint, 'GET');

            const fornecedores = Array.isArray(resultado.registro)
                ? resultado.registro
                : [];

            apresentarFornecedores(fornecedores);

        } catch (erro) {
            corpoTabela.replaceChildren();
            mostrarMensagem(erro.message, 'danger');
        }
    }

    botaoMostrarRemovidos.addEventListener('click', function () {
        mostrarRemovidos = !mostrarRemovidos;

        botaoMostrarRemovidos.textContent = mostrarRemovidos
            ? 'Mostrar ativos'
            : 'Mostrar removidos';

        carregarFornecedores();
    });

    carregarFornecedores();

});
