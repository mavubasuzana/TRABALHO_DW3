document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.getElementById('frmFornecedores');

    if (!formulario) {
        return;
    }

    const TOKEN_KEY = 'tokenDW3';
    const servidorDw3 = formulario.dataset.servidorDw3.replace(/\/+$/, '');

    const campoId = document.getElementById('fornecedorid');
    const campoOper = document.getElementById('oper');
    const campoNome = document.getElementById('nome');
    const campoDocumento = document.getElementById('documento');
    const botaoSalvar = document.getElementById('btnSalvarFornecedor');
    const mensagem = document.getElementById('mensagemFornecedor');

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
                resultado.mensagem ||
                resultado.message ||
                'Não foi possível concluir a operação.'
            );
        }

        return resultado;
    }

    async function carregarFornecedor() {
        if (!id || id === '0' || oper === 'In') {
            return;
        }

        const resultado = await requisitar(
            '/getFornecedorByID/' + encodeURIComponent(id),
            'GET'
        );

        const fornecedor = Array.isArray(resultado.registro)
            ? resultado.registro[0]
            : resultado.registro;

        if (!fornecedor) {
            throw new Error('Fornecedor não encontrado.');
        }

        campoNome.value = fornecedor.nome || '';
        campoDocumento.value = fornecedor.documento || '';

        if (oper === 'Del') {
            campoNome.readOnly = true;
            campoDocumento.readOnly = true;

            botaoSalvar.textContent = 'Confirmar remoção';
            botaoSalvar.classList.remove('btn-primary');
            botaoSalvar.classList.add('btn-danger');
        }
    }

    carregarFornecedor().catch(function (erro) {
        mostrarMensagem(erro.message, 'danger');
        botaoSalvar.disabled = true;
    });

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (oper === 'Del') {
            const confirmado = window.confirm(
                'Tem a certeza de que deseja remover este fornecedor?'
            );

            if (!confirmado) {
                return;
            }
        }

        if (oper === 'Up') {
            const confirmado = window.confirm(
                'Tem a certeza de que deseja atualizar este fornecedor?'
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
                    '/deleteFornecedor/' + encodeURIComponent(id),
                    'DELETE'
                );

                window.location.href = '/fornecedores';
                return;
            }

            const dados = {
                nome: campoNome.value.trim(),
                documento: campoDocumento.value.trim()
            };

            if (!dados.nome) {
                throw new Error('Informe o nome do fornecedor.');
            }

            if (oper === 'Up') {
                await requisitar(
                    '/updateFornecedor/' + encodeURIComponent(id),
                    'PUT',
                    dados
                );
            } else {
                await requisitar('/insertFornecedor', 'POST', dados);
            }

            window.location.href = '/fornecedores';

        } catch (erro) {
            mostrarMensagem(erro.message, 'danger');
            botaoSalvar.disabled = false;
        }
    });

});