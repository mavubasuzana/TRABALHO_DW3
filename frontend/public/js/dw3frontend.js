
/* =========================================================
   SISTEMA FINANCEIRO - TRABALHO DW3
   Arquivo JavaScript compartilhado do Front-End
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    const TOKEN_KEY = 'tokenDW3';

    // Obtém a URL do backend a partir dos templates.
    function obterServidor() {
        const elemento = document.querySelector('[data-servidor-dw3]');

        if (!elemento) {
            return '';
        }

        return elemento.dataset.servidorDw3.replace(/\/+$/, '');
    }

    const servidorDw3 = obterServidor();

    // Escapa valores antes de inseri-los no HTML.
    function escapar(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, function (caractere) {
            const caracteres = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };

            return caracteres[caractere];
        });
    }

    // Exibe mensagens nas páginas.
    function mostrarMensagem(id, mensagem, tipo) {
        const elemento = document.getElementById(id);

        if (!elemento) {
            return;
        }

        elemento.className = tipo
            ? 'alert alert-' + tipo
            : '';

        elemento.textContent = mensagem;
    }

    // Faz requisições ao backend.
    async function requisitar(endpoint, metodo, dados, exigirToken) {
        if (!servidorDw3) {
            throw new Error('A URL do backend não foi configurada.');
        }

        const cabecalhos = {
            'Content-Type': 'application/json'
        };

        if (exigirToken !== false) {
            const token = sessionStorage.getItem(TOKEN_KEY);

            if (!token) {
                window.location.href = '/login';
                throw new Error('Sessão expirada. Entre novamente.');
            }

            cabecalhos.Authorization = 'Bearer ' + token;
        }

        const opcoes = {
            method: metodo,
            headers: cabecalhos
        };

        if (dados !== undefined) {
            opcoes.body = JSON.stringify(dados);
        }

        const resposta = await fetch(
            servidorDw3 + endpoint,
            opcoes
        );

        let resultado;

        try {
            resultado = await resposta.json();
        } catch (erro) {
            throw new Error('O backend retornou uma resposta inválida.');
        }

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

    // Extrai o registro retornado pela API.
    function obterRegistro(resultado) {
        if (!resultado) {
            return null;
        }

        if (Array.isArray(resultado.registro)) {
            return resultado.registro[0] || null;
        }

        return resultado.registro || null;
    }

    // Formata valores monetários.
    function formatarValor(valor) {
        return Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    // Formata datas sem alterar o dia por causa do fuso horário.
    function formatarData(data) {
        if (!data) {
            return '';
        }

        const somenteData = String(data).substring(0, 10);
        const partes = somenteData.split('-');

        if (partes.length !== 3) {
            return escapar(data);
        }

        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    /* =====================================================
       LOGIN
       ===================================================== */

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            const usuario = document.getElementById('usuario').value.trim();
            const senha = document.getElementById('senha').value;
            const botao = document.getElementById('btnEntrar');

            mostrarMensagem('mensagemLogin', '', '');

            if (!usuario || !senha) {
                mostrarMensagem(
                    'mensagemLogin',
                    'Informe o usuário e a senha.',
                    'warning'
                );
                return;
            }

            botao.disabled = true;
            botao.textContent = 'Entrando...';

            try {
                const resultado = await requisitar(
                    '/Login',
                    'POST',
                    {
                        username: usuario,
                        password: senha
                    },
                    false
                );

                if (resultado.auth !== true || !resultado.token) {
                    throw new Error('Usuário ou senha inválidos.');
                }

                sessionStorage.setItem(TOKEN_KEY, resultado.token);

                window.location.href = '/home';

            } catch (erro) {
                mostrarMensagem(
                    'mensagemLogin',
                    erro.message || 'Erro ao realizar login.',
                    'danger'
                );

                botao.disabled = false;
                botao.textContent = 'Entrar';
            }
        });
    }

    /* =====================================================
       LOGOUT
       ===================================================== */

    const btnSair = document.getElementById('btnSair');

    if (btnSair) {
        btnSair.addEventListener('click', async function (evento) {
            evento.preventDefault();

            const token = sessionStorage.getItem(TOKEN_KEY);

            try {
                if (token) {
                    await requisitar('/Logout', 'POST', undefined, true);
                }
            } catch (erro) {
                // A sessão local será encerrada mesmo se o servidor falhar.
            } finally {
                sessionStorage.removeItem(TOKEN_KEY);
                window.location.href = '/login';
            }
        });
    }

    /* =====================================================
       FORNECEDORES - LISTAGEM E RESTAURAÇÃO
       ===================================================== */

    const tabelaFornecedores = document.getElementById('tblFornecedores');
    const btnMostrarRemovidos = document.getElementById('btnMostrarRemovidos');

    if (tabelaFornecedores) {
        let mostrarRemovidos = false;

        async function carregarFornecedores() {
            tabelaFornecedores.innerHTML =
                '<tr><td colspan="4" class="text-center">Carregando...</td></tr>';

            mostrarMensagem('mensagemFornecedores', '', '');

            try {
                const endpoint = mostrarRemovidos
                    ? '/getAllFornecedoresRemovidos'
                    : '/getAllFornecedores';

                const resultado = await requisitar(endpoint, 'GET');
                const registros = resultado.registro || [];

                if (registros.length === 0) {
                    tabelaFornecedores.innerHTML =
                        '<tr><td colspan="4" class="text-center text-secondary">' +
                        'Nenhum fornecedor encontrado.</td></tr>';
                    return;
                }

                tabelaFornecedores.innerHTML = registros.map(function (fornecedor) {
                    const acoes = mostrarRemovidos
                        ? '<button type="button" class="btn btn-sm btn-success" ' +
                          'data-restaurar-fornecedor="' + escapar(fornecedor.id) + '">' +
                          'Restaurar</button>'
                        : '<div class="d-flex justify-content-end gap-2">' +
                          '<a class="btn btn-sm btn-outline-primary" href="/fornecedores/form?oper=Up&fornecedorid=' +
                          encodeURIComponent(fornecedor.id) + '">Editar</a>' +
                          '<a class="btn btn-sm btn-outline-danger" href="/fornecedores/form?oper=Del&fornecedorid=' +
                          encodeURIComponent(fornecedor.id) + '">Remover</a>' +
                          '</div>';

                    return '<tr>' +
                        '<td>' + escapar(fornecedor.id) + '</td>' +
                        '<td>' + escapar(fornecedor.nome) + '</td>' +
                        '<td>' + escapar(fornecedor.documento || '') + '</td>' +
                        '<td class="text-end">' + acoes + '</td>' +
                        '</tr>';
                }).join('');

            } catch (erro) {
                tabelaFornecedores.innerHTML =
                    '<tr><td colspan="4" class="text-center text-danger">' +
                    escapar(erro.message) + '</td></tr>';
            }
        }

        if (btnMostrarRemovidos) {
            btnMostrarRemovidos.addEventListener('click', function () {
                mostrarRemovidos = !mostrarRemovidos;

                btnMostrarRemovidos.textContent = mostrarRemovidos
                    ? 'Mostrar ativos'
                    : 'Mostrar removidos';

                carregarFornecedores();
            });
        }

        tabelaFornecedores.addEventListener('click', async function (evento) {
            const botao = evento.target.closest('[data-restaurar-fornecedor]');

            if (!botao) {
                return;
            }

            botao.disabled = true;

            try {
                await requisitar(
                    '/restaurarFornecedor/' +
                    encodeURIComponent(botao.dataset.restaurarFornecedor),
                    'PUT'
                );

                await carregarFornecedores();

            } catch (erro) {
                mostrarMensagem(
                    'mensagemFornecedores',
                    erro.message,
                    'danger'
                );

                botao.disabled = false;
            }
        });

        carregarFornecedores();
    }

    /* =====================================================
       FORNECEDORES - FORMULÁRIO
       ===================================================== */

    const frmFornecedores = document.getElementById('frmFornecedores');

    if (frmFornecedores) {
        const fornecedorId = document.getElementById('fornecedorid');
        const operacao = document.getElementById('oper');
        const campoNome = document.getElementById('nome');
        const campoDocumento = document.getElementById('documento');
        const botaoSalvar = document.getElementById('btnSalvarFornecedor');

        const oper = operacao.value;
        const id = fornecedorId.value;

        async function carregarFornecedor() {
            if (!id || id === '0' || oper === 'In') {
                return;
            }

            const resultado = await requisitar(
                '/getFornecedorByID/' + encodeURIComponent(id),
                'GET'
            );

            const fornecedor = obterRegistro(resultado);

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
            mostrarMensagem('mensagemFornecedor', erro.message, 'danger');
            botaoSalvar.disabled = true;
        });

        frmFornecedores.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            botaoSalvar.disabled = true;
            mostrarMensagem('mensagemFornecedor', '', '');

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
                mostrarMensagem('mensagemFornecedor', erro.message, 'danger');
                botaoSalvar.disabled = false;
            }
        });
    }

    /* =====================================================
       CONTAS A PAGAR - LISTAGEM E RESTAURAÇÃO
       ===================================================== */

    const tabelaContas = document.getElementById('tblContasPagar');
    const btnMostrarContasRemovidas = document.getElementById('btnMostrarContasRemovidas');

    if (tabelaContas) {
        let mostrarRemovidas = false;

        async function carregarContas() {
            tabelaContas.innerHTML =
                '<tr><td colspan="6" class="text-center">Carregando...</td></tr>';

            mostrarMensagem('mensagemContasPagar', '', '');

            try {
                const endpoint = mostrarRemovidas
                    ? '/getAllContasPagarRemovidas'
                    : '/getAllContasPagar';

                const resultado = await requisitar(endpoint, 'GET');
                const registros = resultado.registro || [];

                if (registros.length === 0) {
                    tabelaContas.innerHTML =
                        '<tr><td colspan="6" class="text-center text-secondary">' +
                        'Nenhuma conta encontrada.</td></tr>';
                    return;
                }

                tabelaContas.innerHTML = registros.map(function (conta) {
                    const acoes = mostrarRemovidas
                        ? '<button type="button" class="btn btn-sm btn-success" ' +
                          'data-restaurar-conta="' + escapar(conta.id) + '">' +
                          'Restaurar</button>'
                        : '<div class="d-flex justify-content-end gap-2">' +
                          '<a class="btn btn-sm btn-outline-primary" href="/contas-pagar/form?oper=Up&contaid=' +
                          encodeURIComponent(conta.id) + '">Editar</a>' +
                          '<a class="btn btn-sm btn-outline-danger" href="/contas-pagar/form?oper=Del&contaid=' +
                          encodeURIComponent(conta.id) + '">Remover</a>' +
                          '</div>';

                    return '<tr>' +
                        '<td>' + escapar(conta.id) + '</td>' +
                        '<td>' + escapar(conta.fornecedor || conta.fornecedor_id) + '</td>' +
                        '<td>' + escapar(conta.descricao) + '</td>' +
                        '<td>' + escapar(formatarValor(conta.valor)) + '</td>' +
                        '<td>' + formatarData(conta.data_vencimento) + '</td>' +
                        '<td class="text-end">' + acoes + '</td>' +
                        '</tr>';
                }).join('');

            } catch (erro) {
                tabelaContas.innerHTML =
                    '<tr><td colspan="6" class="text-center text-danger">' +
                    escapar(erro.message) + '</td></tr>';
            }
        }

        if (btnMostrarContasRemovidas) {
            btnMostrarContasRemovidas.addEventListener('click', function () {
                mostrarRemovidas = !mostrarRemovidas;

                btnMostrarContasRemovidas.textContent = mostrarRemovidas
                    ? 'Mostrar ativas'
                    : 'Mostrar removidas';

                carregarContas();
            });
        }

        tabelaContas.addEventListener('click', async function (evento) {
            const botao = evento.target.closest('[data-restaurar-conta]');

            if (!botao) {
                return;
            }

            botao.disabled = true;

            try {
                await requisitar(
                    '/restaurarContaPagar/' +
                    encodeURIComponent(botao.dataset.restaurarConta),
                    'PUT'
                );

                await carregarContas();

            } catch (erro) {
                mostrarMensagem(
                    'mensagemContasPagar',
                    erro.message,
                    'danger'
                );

                botao.disabled = false;
            }
        });

        carregarContas();
    }

    /* =====================================================
       CONTAS A PAGAR - FORMULÁRIO
       ===================================================== */

    const frmContasPagar = document.getElementById('frmContasPagar');

    if (frmContasPagar) {
        const contaId = document.getElementById('contaid');
        const operacao = document.getElementById('oper');
        const campoFornecedor = document.getElementById('fornecedor_id');
        const campoDescricao = document.getElementById('descricao');
        const campoValor = document.getElementById('valor');
        const campoVencimento = document.getElementById('data_vencimento');
        const botaoSalvar = document.getElementById('btnSalvarContaPagar');

        const oper = operacao.value;
        const id = contaId.value;

        async function carregarFornecedoresAtivos() {
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

            const conta = obterRegistro(resultado);

            if (!conta) {
                throw new Error('Conta a pagar não encontrada.');
            }

            campoFornecedor.value = conta.fornecedor_id;
            campoDescricao.value = conta.descricao || '';
            campoValor.value = conta.valor;
            campoVencimento.value = String(conta.data_vencimento || '').substring(0, 10);

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
            await carregarFornecedoresAtivos();
            await carregarConta();
        }

        prepararFormulario().catch(function (erro) {
            mostrarMensagem('mensagemContaPagar', erro.message, 'danger');
            botaoSalvar.disabled = true;
        });

        frmContasPagar.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            botaoSalvar.disabled = true;
            mostrarMensagem('mensagemContaPagar', '', '');

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
                mostrarMensagem('mensagemContaPagar', erro.message, 'danger');
                botaoSalvar.disabled = false;
            }
        });
    }

});
