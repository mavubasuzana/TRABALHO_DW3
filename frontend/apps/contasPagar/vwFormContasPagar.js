
document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.getElementById('frmContasPagar');

    if (!formulario) {
        return;
    }

    const TOKEN_KEY = 'tokenDW3';
    const servidorDw3 = formulario.dataset.servidorDw3.replace(/\/+$/, '');

    const campoId = document.getElementById('contaid');
    const campoOper = document.getElementById('oper');
    const campoFornecedor = document.getElementById('fornecedor_id');
    const campoDescricao = document.getElementById('descricao');
    const campoValor = document.getElementById('valor');
    const campoVencimento = document.getElementById('data_vencimento');
    const botaoSalvar = document.getElementById('btnSalvarContaPagar');
    const mensagem = document.getElementById('mensagemContaPagar');

    const oper = campoOper.value;
    const id = campoId.value;

    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = tipo ? 'alert alert-' + tipo : '';
    }

    async function requisitar(endpoint, metodo, dados) {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (!token) {
            window.location.href = '/login';
            throw new Error('Sessão não encontrada. Entre novamente.');
        }

        const cabecalhos = {
            'Authorization': 'Bearer ' + token
        };

        const opcoes = {
            method: metodo,
            headers: cabecalhos
        };

        if (dados !== undefined) {
            cabecalhos['Content-Type'] = 'application/json';
            opcoes.body = JSON.stringify(dados);
        }

        const resposta = await fetch(servidorDw3 + endpoint, opcoes);
        const resultado = await resposta.json();

        if (resposta.status === 401 || resposta.status === 403) {
            sessionStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
            throw new Error('Sessão expirada. Entre novamente.');
        }

        if (!resposta.ok || resultado.status === 'erro') {
            throw new Error(
                resultado.message ||
                resultado.mensagem ||
                'Não foi possível concluir a operação.'
            );
        }

        return resultado;
    }

    async function carregarFornecedores() {
        const resultado = await requisitar('/getAllFornecedores', 'GET');
        const fornecedores = resultado.registro || [];

        campoFornecedor.innerHTML =
            '<option value="">Selecione um fornecedor</option>';

        fornecedores.forEach(function (fornecedor) {
            const opcao = document.createElement('option');

            opcao.value = fornecedor.id;
            opcao.textContent = fornecedor.nome;

            campoFornecedor.appendChild(opcao);
        });
    }

    async function carregarConta() {
        if (!id || id === '0' || oper === 'In') {
            return;
        }

        const resultado = await requisitar(
            '/getContaPagarByID/' + encodeURIComponent(id),
            'GET'
        );

        const conta = Array.isArray(resultado.registro)
            ? resultado.registro[0]
            : resultado.registro;

        if (!conta) {
            throw new Error('Conta a pagar não encontrada.');
        }

        campoFornecedor.value = conta.fornecedor_id;
        campoDescricao.value = conta.descricao || '';
        campoValor.value = conta.valor;
        campoVencimento.value =
            String(conta.data_vencimento || '').substring(0, 10);

        if (oper === 'Del') {
            campoFornecedor.disabled = true;
            campoDescricao.readOnly = true;
            campoValor.readOnly = true;
            campoVencimento.readOnly = true;

            botaoSalvar.textContent = 'Confirmar remoção';
            botaoSalvar.classList.remove('btn-primary');
            botaoSalvar.classList.add('btn-danger');
        }
    }

    async function prepararFormulario() {
        await carregarFornecedores();
        await carregarConta();
    }

    prepararFormulario().catch(function (erro) {
        mostrarMensagem(erro.message, 'danger');
        botaoSalvar.disabled = true;
    });

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        // Confirmação antes de remover uma conta a pagar.
        if (oper === 'Del') {
            const confirmado = window.confirm(
                'Tem a certeza de que deseja remover esta conta a pagar?'
            );

            if (!confirmado) {
                return;
            }
        }

        // Confirmação antes de atualizar uma conta a pagar.
        if (oper === 'Up') {
            const confirmado = window.confirm(
                'Tem a certeza de que deseja atualizar esta conta a pagar?'
            );

            if (!confirmado) {
                return;
            }
        }

        botaoSalvar.disabled = true;
        mostrarMensagem('', '');

        try {
            if (oper === 'Del') {
                await requisitar(
                    '/deleteContaPagar/' + encodeURIComponent(id),
                    'DELETE'
                );

                window.location.href = '/contas-pagar';
                return;
            }

            const dados = {
                fornecedor_id: Number(campoFornecedor.value),
                descricao: campoDescricao.value.trim(),
                valor: Number(campoValor.value),
                data_vencimento: campoVencimento.value
            };

            if (!dados.fornecedor_id) {
                throw new Error('Selecione um fornecedor.');
            }

            if (!dados.descricao) {
                throw new Error('Informe a descrição da conta.');
            }

            if (!Number.isFinite(dados.valor) || dados.valor <= 0) {
                throw new Error('Informe um valor válido.');
            }

            if (!dados.data_vencimento) {
                throw new Error('Informe a data de vencimento.');
            }

            if (oper === 'Up') {
                await requisitar(
                    '/updateContaPagar/' + encodeURIComponent(id),
                    'PUT',
                    dados
                );
            } else {
                await requisitar('/insertContaPagar', 'POST', dados);
            }

            window.location.href = '/contas-pagar';

        } catch (erro) {
            mostrarMensagem(erro.message, 'danger');
            botaoSalvar.disabled = false;
        }
    });

});
