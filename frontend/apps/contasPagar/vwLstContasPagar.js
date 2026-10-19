
document.addEventListener('DOMContentLoaded', function () {

    const corpoTabela = document.getElementById('tblContasPagar');
    const botaoMostrarRemovidas = document.getElementById('btnMostrarContasRemovidas');
    const mensagem = document.getElementById('mensagemContasPagar');

    if (!corpoTabela) {
        console.error('O elemento tblContasPagar não foi encontrado.');
        return;
    }

    const TOKEN_KEY = 'tokenDW3';
    const servidorDw3 = corpoTabela.dataset.servidorDw3.replace(/\/+$/, '');

    let mostrarRemovidas = false;

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

    function formatarValor(valor) {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return valor == null ? '' : String(valor);
        }

        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatarData(data) {
        if (!data) {
            return '';
        }

        const texto = String(data);

        // Evita que uma data YYYY-MM-DD mude de dia por causa do fuso horário.
        const correspondencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (correspondencia) {
            return correspondencia[3] + '/' +
                correspondencia[2] + '/' +
                correspondencia[1];
        }

        return texto;
    }

    function mostrarCarregamento() {
        corpoTabela.replaceChildren();

        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 6;
        celula.className = 'text-center text-secondary';
        celula.textContent = 'Carregando contas a pagar...';

        linha.appendChild(celula);
        corpoTabela.appendChild(linha);
    }

    function mostrarTabelaVazia() {
        corpoTabela.replaceChildren();

        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 6;
        celula.className = 'text-center text-secondary';
        celula.textContent = 'Nenhuma conta a pagar encontrada.';

        linha.appendChild(celula);
        corpoTabela.appendChild(linha);
    }

    async function restaurarConta(id, botao) {
        const confirmado = window.confirm(
            'Tem a certeza de que deseja restaurar esta conta a pagar?'
        );

        if (!confirmado) {
            return;
        }

        botao.disabled = true;

        try {
            await requisitar(
                '/restaurarContaPagar/' + encodeURIComponent(id),
                'PUT'
            );

            mostrarMensagem('Conta a pagar restaurada com sucesso.', 'success');

            await carregarContas();

        } catch (erro) {
            mostrarMensagem(erro.message, 'danger');
            botao.disabled = false;
        }
    }

    function apresentarContas(contas) {
        corpoTabela.replaceChildren();

        if (!contas.length) {
            mostrarTabelaVazia();
            return;
        }

        contas.forEach(function (conta) {
            const linha = document.createElement('tr');

            const fornecedor = conta.fornecedor ||
                conta.fornecedor_nome ||
                conta.fornecedor_id;

            linha.appendChild(criarCelula(conta.id));
            linha.appendChild(criarCelula(fornecedor));
            linha.appendChild(criarCelula(conta.descricao));
            linha.appendChild(criarCelula(formatarValor(conta.valor)));
            linha.appendChild(criarCelula(formatarData(conta.data_vencimento)));

            const celulaAcoes = document.createElement('td');
            celulaAcoes.className = 'text-end';

            if (mostrarRemovidas) {
                const botaoRestaurar = criarBotao(
                    'Restaurar',
                    'btn btn-success btn-sm',
                    function () {
                        restaurarConta(conta.id, botaoRestaurar);
                    }
                );

                celulaAcoes.appendChild(botaoRestaurar);

            } else {
                const linkEditar = criarLink(
                    'Editar',
                    '/contas-pagar/form?oper=Up&contaid=' +
                        encodeURIComponent(conta.id),
                    'btn btn-primary btn-sm me-2'
                );

                const linkRemover = criarLink(
                    'Remover',
                    '/contas-pagar/form?oper=Del&contaid=' +
                        encodeURIComponent(conta.id),
                    'btn btn-danger btn-sm'
                );

                celulaAcoes.appendChild(linkEditar);
                celulaAcoes.appendChild(linkRemover);
            }

            linha.appendChild(celulaAcoes);
            corpoTabela.appendChild(linha);
        });
    }

    async function carregarContas() {
        mostrarCarregamento();
        mostrarMensagem('', '');

        try {
            const endpoint = mostrarRemovidas
                ? '/getAllContasPagarRemovidas'
                : '/getAllContasPagar';

            const resultado = await requisitar(endpoint, 'GET');

            const contas = Array.isArray(resultado.registro)
                ? resultado.registro
                : [];

            apresentarContas(contas);

        } catch (erro) {
            corpoTabela.replaceChildren();
            mostrarMensagem(erro.message, 'danger');
        }
    }

    botaoMostrarRemovidas.addEventListener('click', function () {
        mostrarRemovidas = !mostrarRemovidas;

        botaoMostrarRemovidas.textContent = mostrarRemovidas
            ? 'Mostrar ativas'
            : 'Mostrar removidas';

        carregarContas();
    });

    carregarContas();

});
