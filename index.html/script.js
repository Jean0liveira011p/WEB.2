function obterAlunos() {
    return JSON.parse(localStorage.getItem("alunos")) || [];
}

function salvarAlunos(alunos) {
    localStorage.setItem("alunos", JSON.stringify(alunos));
}

function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");
    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterUsuariosPadrao() {
    return [
        { usuario: "master", senha: "1234", tipo: "master", bloqueado: false },
        { usuario: "admin", senha: "admin123", tipo: "admin", bloqueado: false },
        { usuario: "funcionario", senha: "123", tipo: "funcionario", bloqueado: false }
    ];
}

function obterUsuariosSistema() {
    let usuarios = JSON.parse(localStorage.getItem("usuariosSistema"));

    if (!usuarios || !Array.isArray(usuarios) || usuarios.length === 0) {
        usuarios = obterUsuariosPadrao();
        localStorage.setItem("usuariosSistema", JSON.stringify(usuarios));
    }

    return usuarios;
}

function salvarUsuariosSistema(usuarios) {
    localStorage.setItem("usuariosSistema", JSON.stringify(usuarios));
}

function obterCodigoSegurancaAtual() {
    let codigo = localStorage.getItem("codigoSegurancaSistema");

    if (!codigo) {
        codigo = "1234";
        localStorage.setItem("codigoSegurancaSistema", codigo);
    }

    return codigo;
}

function obterHistoricoAlunos() {
    return JSON.parse(localStorage.getItem("historicoAlunos")) || [];
}

function salvarHistoricoAlunos(historico) {
    localStorage.setItem("historicoAlunos", JSON.stringify(historico));
}

function registrarHistorico(acao, aluno, detalhes = "") {
    const historico = obterHistoricoAlunos();

    historico.unshift({
        data: new Date().toLocaleString("pt-BR"),
        acao: acao,
        aluno: aluno,
        detalhes: detalhes
    });

    salvarHistoricoAlunos(historico);
}

/* ===== CONTROLE DE EXIBIÇÃO DE MENSAGENS ===== */
let ultimoMomentoMensagem = 0;

/* ===== MENSAGENS NA TELA ===== */
function obterCaixaMensagem() {
    let caixa =
        document.getElementById("mensagem-cadastro") ||
        document.getElementById("mensagem-edicao") ||
        document.getElementById("mensagem-lista") ||
        document.getElementById("mensagem-perfil") ||
        document.getElementById("mensagem-senha") ||
        document.getElementById("erro-login");

    if (!caixa) {
        const container =
            document.querySelector(".login-box") ||
            document.querySelector(".container") ||
            document.querySelector(".perfil-card") ||
            document.querySelector("main");

        if (container) {
            caixa = document.createElement("p");
            caixa.id = "mensagem-sistema";
            caixa.style.display = "none";
            caixa.style.marginTop = "15px";
            caixa.style.textAlign = "center";
            caixa.style.fontWeight = "bold";
            caixa.style.fontSize = "15px";
            container.appendChild(caixa);
        }
    }

    return caixa;
}

function posicionarMensagemPerfil() {
    const mensagemPerfil = document.getElementById("mensagem-perfil");
    const perfilCard = document.querySelector(".perfil-card");

    if (!mensagemPerfil || !perfilCard) return;

    if (perfilCard.nextElementSibling !== mensagemPerfil) {
        perfilCard.insertAdjacentElement("afterend", mensagemPerfil);
    }

    mensagemPerfil.style.marginTop = "18px";
    mensagemPerfil.style.marginBottom = "0";
    mensagemPerfil.style.textAlign = "center";
    mensagemPerfil.style.fontWeight = "bold";
}

function mostrarMensagem(texto, tipo = "erro") {
    const caixa = obterCaixaMensagem();
    if (!caixa) return;

    if (caixa.id === "mensagem-perfil") {
        posicionarMensagemPerfil();
    }

    caixa.style.display = "block";
    caixa.style.color = tipo === "sucesso" ? "green" : "red";
    caixa.innerText = texto;

    ultimoMomentoMensagem = Date.now();
}

function esconderMensagem() {
    const caixa =
        document.getElementById("mensagem-cadastro") ||
        document.getElementById("mensagem-edicao") ||
        document.getElementById("mensagem-lista") ||
        document.getElementById("mensagem-perfil") ||
        document.getElementById("mensagem-senha") ||
        document.getElementById("erro-login") ||
        document.getElementById("mensagem-sistema");

    if (caixa) {
        caixa.style.display = "none";
    }
}

function cadastrar() {
    const nomeInput = document.getElementById("nome");
    const dataInput = document.getElementById("dataNascimento");
    const telefoneInput = document.getElementById("telefone");
    const cpfInput = document.getElementById("cpf");
    const planoInput = document.getElementById("plano");
    const pagamentoInput = document.getElementById("pagamento");

    if (!nomeInput || !dataInput || !telefoneInput || !cpfInput || !planoInput || !pagamentoInput) {
        mostrarMensagem("Os campos do cadastro não foram encontrados na tela.");
        return;
    }

    const nome = nomeInput.value.trim();
    const dataNascimento = dataInput.value;
    const telefone = telefoneInput.value.trim();
    const cpf = cpfInput.value.trim();
    const plano = planoInput.value;
    const pagamento = pagamentoInput.value;

    if (nome === "" || dataNascimento === "" || telefone === "" || cpf === "" || plano === "" || pagamento === "") {
        mostrarMensagem("Preencha todos os campos.");
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarMensagem("CPF inválido.");
        return;
    }

    const alunos = obterAlunos();

    const aluno = {
        nome: nome,
        dataNascimento: dataNascimento,
        telefone: telefone,
        cpf: cpf,
        plano: plano,
        pagamento: pagamento,
        foto: ""
    };

    alunos.push(aluno);
    salvarAlunos(alunos);

    registrarHistorico("Cadastro", nome, "Aluno cadastrado no sistema.");

    mostrarMensagem("Aluno cadastrado com sucesso!", "sucesso");

    nomeInput.value = "";
    dataInput.value = "";
    telefoneInput.value = "";
    cpfInput.value = "";
    planoInput.value = "";
    pagamentoInput.value = "";
}

function carregarLista() {
    const tabela = document.getElementById("listaAlunos");
    if (!tabela) return;

    const alunos = obterAlunos();
    tabela.innerHTML = "";

    alunos.forEach((aluno, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${aluno.nome}</td>
            <td>${formatarData(aluno.dataNascimento)}</td>
            <td>${aluno.telefone || ""}</td>
            <td>${aluno.cpf}</td>
            <td>${aluno.plano}</td>
            <td>${aluno.pagamento}</td>
            <td>
                <div class="acoes-menu">
                    <button type="button" class="btn-tres-pontos" onclick="toggleMenuAcao(this)">⋯</button>

                    <div class="menu-acoes-dropdown">
                        <button type="button" class="btn-perfil" onclick="verPerfil(${index})">Visualizar Perfil</button>
                        <button type="button" class="btn-editar" onclick="editarAluno(${index})">Editar</button>
                        <button type="button" class="btn-excluir" onclick="excluirAluno(${index})">Excluir</button>
                    </div>
                </div>
            </td>
        `;

        tabela.appendChild(linha);
    });
}

function toggleMenuAcao(botao) {
    const menuAtual = botao.nextElementSibling;

    document.querySelectorAll(".menu-acoes-dropdown.aberto").forEach(menu => {
        if (menu !== menuAtual) {
            menu.classList.remove("aberto");
        }
    });

    menuAtual.classList.toggle("aberto");
}

document.addEventListener("click", function (e) {
    if (!e.target.closest(".acoes-menu")) {
        document.querySelectorAll(".menu-acoes-dropdown.aberto").forEach(menu => {
            menu.classList.remove("aberto");
        });
    }

    const caixa =
        document.getElementById("mensagem-cadastro") ||
        document.getElementById("mensagem-edicao") ||
        document.getElementById("mensagem-lista") ||
        document.getElementById("mensagem-perfil") ||
        document.getElementById("mensagem-senha") ||
        document.getElementById("erro-login") ||
        document.getElementById("mensagem-sistema");

    if (!caixa) return;

    if (caixa.style.display === "block" && Date.now() - ultimoMomentoMensagem > 150) {
        esconderMensagem();
    }
});

function verPerfil(index) {
    localStorage.setItem("alunoPerfil", index);
    window.location.href = "perfil.html";
}

function carregarPerfil() {
    const alunos = obterAlunos();
    const index = localStorage.getItem("alunoPerfil");

    if (index === null || !alunos[index]) return;

    const aluno = alunos[index];

    document.getElementById("perfilNome").innerText = aluno.nome;
    document.getElementById("perfilData").innerText = formatarData(aluno.dataNascimento);
    document.getElementById("perfilTelefone").innerText = aluno.telefone || "-";
    document.getElementById("perfilCpf").innerText = aluno.cpf;
    document.getElementById("perfilPlano").innerText = aluno.plano;
    document.getElementById("perfilPagamento").innerText = aluno.pagamento;

    const foto = document.getElementById("fotoAluno");

    if (foto) {
        if (aluno.foto && aluno.foto.trim() !== "") {
            foto.src = aluno.foto;
            foto.style.opacity = "1";
        } else {
            foto.src = "";
            foto.style.opacity = "0";
        }
    }

    posicionarMensagemPerfil();
}

function salvarFoto() {
    const alunos = obterAlunos();
    const index = localStorage.getItem("alunoPerfil");
    const input = document.getElementById("inputFoto");
    const foto = document.getElementById("fotoAluno");

    if (index === null || !alunos[index] || !input.files[0] || !foto) {
        mostrarMensagem("Selecione uma foto para continuar.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        alunos[index].foto = reader.result;
        salvarAlunos(alunos);

        foto.src = reader.result;
        foto.style.opacity = "1";

        registrarHistorico("Foto adicionada", alunos[index].nome, "Foto do perfil adicionada.");

        mostrarMensagem("Foto adicionada com sucesso!", "sucesso");
    };

    reader.readAsDataURL(input.files[0]);
}

function editarAluno(index) {
    localStorage.setItem("alunoEditando", index);
    window.location.href = "editar.html";
}

function carregarAlunoParaEdicao() {
    const alunos = obterAlunos();
    const index = localStorage.getItem("alunoEditando");

    if (index === null || !alunos[index]) return;

    const aluno = alunos[index];

    document.getElementById("nome").value = aluno.nome;
    document.getElementById("dataNascimento").value = aluno.dataNascimento;
    document.getElementById("telefone").value = aluno.telefone || "";
    document.getElementById("cpf").value = aluno.cpf;
    document.getElementById("plano").value = aluno.plano;
    document.getElementById("pagamento").value = aluno.pagamento;
}

function salvarEdicao() {
    const alunos = obterAlunos();
    const index = localStorage.getItem("alunoEditando");

    if (index === null || !alunos[index]) return;

    const nome = document.getElementById("nome").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value;
    const telefone = document.getElementById("telefone").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const plano = document.getElementById("plano").value;
    const pagamento = document.getElementById("pagamento").value;

    if (!nome || !dataNascimento || !telefone || !cpf || !plano || !pagamento) {
        mostrarMensagem("Preencha todos os campos.");
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarMensagem("CPF inválido.");
        return;
    }

    alunos[index] = {
        ...alunos[index],
        nome,
        dataNascimento,
        telefone,
        cpf,
        plano,
        pagamento
    };

    salvarAlunos(alunos);
    registrarHistorico("Edição", nome, "Dados do aluno atualizados.");

    mostrarMensagem("Aluno atualizado com sucesso!", "sucesso");

    setTimeout(() => {
        window.location.href = "lista.html";
    }, 1200);
}

function excluirAluno(index) {
    const alunos = obterAlunos();

    if (!alunos[index]) {
        mostrarMensagem("Aluno não encontrado.");
        return;
    }

    const nomeAluno = alunos[index].nome;

    alunos.splice(index, 1);
    salvarAlunos(alunos);

    registrarHistorico("Exclusão", nomeAluno, "Aluno removido do sistema.");

    carregarLista();
    mostrarMensagem("Aluno excluído com sucesso!", "sucesso");
}

function buscar() {
    const campoBusca = document.getElementById("busca");
    const linhas = document.querySelectorAll("#listaAlunos tr");

    const filtro = campoBusca.value.toLowerCase();

    linhas.forEach(linha => {
        const texto = linha.innerText.toLowerCase();
        linha.style.display = texto.includes(filtro) ? "" : "none";
    });
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");

    if (cpf.length !== 11) return false;
    if (/^(.)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// ===== LOGIN =====
function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erro-login");

    if (usuario.trim() === "" || senha.trim() === "") {
        if (erro) {
            erro.style.display = "block";
            erro.style.color = "red";
            erro.innerText = "Preencha todos os campos.";
            ultimoMomentoMensagem = Date.now();
        }
        return;
    }

    const usuarios = obterUsuariosSistema();

    const usuarioEncontrado = usuarios.find(u =>
        u.usuario === usuario && u.senha === senha
    );

    if (!usuarioEncontrado) {
        if (erro) {
            erro.style.display = "block";
            erro.style.color = "red";
            erro.innerText = "Usuário ou senha incorretos. Verifique as informações e tente novamente.";
            ultimoMomentoMensagem = Date.now();
        }
        return;
    }

    if (usuarioEncontrado.bloqueado) {
        if (erro) {
            erro.style.display = "block";
            erro.style.color = "red";
            erro.innerText = "Este usuário está bloqueado. Entre em contato com o suporte para mais informações.";
            ultimoMomentoMensagem = Date.now();
        }
        return;
    }

    if (erro) {
        erro.style.display = "none";
    }

    localStorage.setItem("usuarioLogado", usuarioEncontrado.tipo);
    localStorage.setItem("usuarioNomeLogado", usuarioEncontrado.usuario);

    window.location.href = "index.html";
}

function esqueciSenha() {
    window.location.href = "alterar-senha.html";
}

function validarCredencialForte(valor) {
    if (valor.length < 8) {
        return "A nova senha ou código deve ter no mínimo 8 caracteres.";
    }

    const numeros = valor.match(/\d/g) || [];
    if (numeros.length < 2) {
        return "A nova senha ou código deve ter no mínimo 2 números.";
    }

    const especiais = valor.match(/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'~`]/g) || [];
    if (especiais.length < 1) {
        return "A nova senha ou código deve ter no mínimo 1 caractere especial.";
    }

    if (!/[A-Z]/.test(valor)) {
        return "A nova senha ou código deve ter no mínimo 1 letra maiúscula.";
    }

    if (!/[a-z]/.test(valor)) {
        return "A nova senha ou código deve ter no mínimo 1 letra minúscula.";
    }

    return "";
}


function alterarSenha() {
    const usuarioInput = document.getElementById("usuario-recuperacao");
    const codigoInput = document.getElementById("codigo-seguranca");
    const novaSenhaInput = document.getElementById("nova-senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");
    const mensagem = document.getElementById("mensagem-senha");

    if (!usuarioInput || !codigoInput || !novaSenhaInput || !confirmarSenhaInput || !mensagem) {
        mostrarMensagem("Os campos da tela de alterar senha não foram encontrados.");
        return;
    }

    const usuario = usuarioInput.value.trim();
    const codigo = codigoInput.value.trim();
    const novaSenha = novaSenhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    const usuarios = obterUsuariosSistema();
    const codigoSistema = obterCodigoSegurancaAtual();

    mensagem.style.display = "block";
    ultimoMomentoMensagem = Date.now();

    if (usuario === "" || codigo === "" || novaSenha === "" || confirmarSenha === "") {
        mensagem.style.color = "red";
        mensagem.innerText = "Preencha todos os campos.";
        return;
    }

    if (codigo !== codigoSistema) {
        mensagem.style.color = "red";
        mensagem.innerText = "Código de segurança inválido.";
        return;
    }

    const usuarioIndex = usuarios.findIndex(u => u.usuario === usuario);

    if (usuarioIndex === -1) {
        mensagem.style.color = "red";
        mensagem.innerText = "Usuário não encontrado.";
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mensagem.style.color = "red";
        mensagem.innerText = "As senhas não coincidem.";
        return;
    }

    const erroForcaSenha = validarCredencialForte(novaSenha);

    if (erroForcaSenha !== "") {
        mensagem.style.color = "red";
        mensagem.innerText = erroForcaSenha;
        return;
    }

    usuarios[usuarioIndex].senha = novaSenha;
    salvarUsuariosSistema(usuarios);

    mensagem.style.color = "green";
    mensagem.innerText = "Senha alterada com sucesso!";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
}

function esconderErro() {
    const erro = document.getElementById("erro-login");
    if (erro) {
        erro.style.display = "none";
    }
}

function toggleSenha(id, elemento) {
    const input = document.getElementById(id);

    if (!input || !elemento) return;

    if (input.type === "password") {
        input.type = "text";
        elemento.classList.remove("bi-eye-slash");
        elemento.classList.add("bi-eye");
    } else {
        input.type = "password";
        elemento.classList.remove("bi-eye");
        elemento.classList.add("bi-eye-slash");
    }
}

// ===== VERIFICAR LOGIN =====
function verificarLogin() {
    const usuario = localStorage.getItem("usuarioLogado");

    if (!usuario) {
        window.location.href = "login.html";
    }
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

// ===== EVENTOS AO CARREGAR =====
document.addEventListener("DOMContentLoaded", function () {
    obterUsuariosSistema();
    obterCodigoSegurancaAtual();

    const cpfInput = document.getElementById("cpf");
    const campoUsuario = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");
    const telefoneInput = document.getElementById("telefone");

    posicionarMensagemPerfil();

    if (cpfInput) {
        cpfInput.addEventListener("input", function (e) {
            let valor = e.target.value.replace(/\D/g, "");

            if (valor.length > 11) {
                valor = valor.slice(0, 11);
            }

            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

            e.target.value = valor;
        });
    }

    if (telefoneInput) {
        telefoneInput.addEventListener("input", function (e) {
            let valor = e.target.value.replace(/\D/g, "");

            if (valor.length === 0) {
                e.target.value = "";
                return;
            }

            if (valor.length > 11) {
                valor = valor.slice(0, 11);
            }

            if (valor.length > 6) {
                valor = valor.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
            } else if (valor.length > 2) {
                valor = valor.replace(/(\d{2})(\d{1,5})/, "($1) $2");
            } else {
                valor = valor.replace(/(\d{1,2})/, "($1");
            }

            e.target.value = valor;
        });
    }

    if (campoUsuario) {
        campoUsuario.addEventListener("input", esconderErro);
    }

    if (campoSenha) {
        campoSenha.addEventListener("input", esconderErro);
    }
});

function removerFoto() {
    const alunos = obterAlunos();
    const index = localStorage.getItem("alunoPerfil");
    const foto = document.getElementById("fotoAluno");

    if (index === null || !alunos[index] || !foto) return;

    const nomeAluno = alunos[index].nome;

    alunos[index].foto = "";
    salvarAlunos(alunos);

    foto.src = "";
    foto.style.opacity = "0";

    registrarHistorico("Foto removida", nomeAluno, "Foto do perfil removida.");

    mostrarMensagem("Foto removida com sucesso!", "sucesso");
}
function configurarMenuMaster() {
    const usuario = localStorage.getItem("usuarioLogado");
    const opcaoMaster = document.getElementById("opcao-master");

    if (!opcaoMaster) return;

    if (usuario === "master") {
        opcaoMaster.style.display = "flex";
    } else {
        opcaoMaster.style.display = "none";
    }
}

function verificarMaster() {
    const usuario = localStorage.getItem("usuarioLogado");

    if (usuario !== "master") {
        window.location.href = "index.html";
    }
}

function carregarStatusAdmin() {
    const usuarios = obterUsuariosSistema();
    const admin = usuarios.find(u => u.usuario === "admin");
    const status = document.getElementById("status-admin");

    if (!status || !admin) return;

    status.innerText = admin.bloqueado ? "Status: BLOQUEADO" : "Status: ATIVO";
    status.style.color = admin.bloqueado ? "red" : "green";
    status.style.fontWeight = "bold";
}

function toggleBloqueioAdmin() {
    const usuarios = obterUsuariosSistema();
    const adminIndex = usuarios.findIndex(u => u.usuario === "admin");
    const mensagem = document.getElementById("mensagem-master");

    if (adminIndex === -1) return;

    usuarios[adminIndex].bloqueado = !usuarios[adminIndex].bloqueado;
    salvarUsuariosSistema(usuarios);

    carregarStatusAdmin();

    if (mensagem) {
        mensagem.style.display = "block";
        mensagem.style.color = usuarios[adminIndex].bloqueado ? "red" : "green";
        mensagem.innerText = usuarios[adminIndex].bloqueado
            ? "Usuário admin bloqueado com sucesso!"
            : "Usuário admin desbloqueado com sucesso!";
    }
}

function carregarHistoricoAlunos() {
    const tabela = document.getElementById("tabelaHistorico");
    if (!tabela) return;

    const historico = obterHistoricoAlunos();
    tabela.innerHTML = "";

    if (historico.length === 0) {
        tabela.innerHTML = `<tr><td colspan="4">Nenhum histórico encontrado.</td></tr>`;
        return;
    }

    historico.forEach(item => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${item.data}</td>
            <td>${item.acao}</td>
            <td>${item.aluno}</td>
            <td>${item.detalhes}</td>
        `;
        tabela.appendChild(linha);
    });
}

function preencherCodigoAtual() {
    const campo = document.getElementById("codigo-atual-master");
    if (!campo) return;

    campo.value = obterCodigoSegurancaAtual();
}

function salvarNovoCodigoSeguranca() {
    const novoCodigo = document.getElementById("novo-codigo-master");
    const confirmarCodigo = document.getElementById("confirmar-codigo-master");
    const mensagem = document.getElementById("mensagem-codigo");

    if (!novoCodigo || !confirmarCodigo || !mensagem) return;

    const codigo1 = novoCodigo.value.trim();
    const codigo2 = confirmarCodigo.value.trim();

    mensagem.style.display = "block";

    if (codigo1 === "" || codigo2 === "") {
        mensagem.style.color = "red";
        mensagem.innerText = "Preencha todos os campos.";
        return;
    }

    if (codigo1 !== codigo2) {
        mensagem.style.color = "red";
        mensagem.innerText = "Os códigos não coincidem.";
        return;
    }

    const erroForcaCodigo = validarCredencialForte(codigo1);

    if (erroForcaCodigo !== "") {
        mensagem.style.color = "red";
        mensagem.innerText = erroForcaCodigo;
        return;
    }

    localStorage.setItem("codigoSegurancaSistema", codigo1);

    mensagem.style.color = "green";
    mensagem.innerText = "Código de segurança alterado com sucesso!";

    preencherCodigoAtual();
    novoCodigo.value = "";
    confirmarCodigo.value = "";
}