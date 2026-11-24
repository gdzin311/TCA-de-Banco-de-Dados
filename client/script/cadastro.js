const formulario = document.getElementById('form-cadastro');
const campoErro = document.getElementById('erro');
const campoSucesso = document.getElementById('sucesso');
const botao = formulario.querySelector('button[type="submit"]');

// impede escolher uma data de nascimento no futuro (usa a data local, sem fuso)
const agora = new Date();
const hoje = agora.getFullYear() + '-'
    + String(agora.getMonth() + 1).padStart(2, '0') + '-'
    + String(agora.getDate()).padStart(2, '0');
document.getElementById('nascimento').max = hoje;

formulario.addEventListener('submit', async function (evento)
{
    evento.preventDefault();
    campoErro.hidden = true;
    campoSucesso.hidden = true;

    const dados =
    {
        nome: document.getElementById('nome').value.trim(),
        cpf: document.getElementById('cpf').value,
        nascimento: document.getElementById('nascimento').value,
        genero: document.getElementById('genero').value,
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value
    };
    const confirmacao = document.getElementById('confirmar-senha').value;

    // validações rápidas no navegador (o servidor valida de novo)
    if (dados.cpf.replace(/\D/g, '').length !== 11)
    {
        mostrarErro('O CPF deve ter 11 dígitos');
        return;
    }
    if (dados.senha.length < 6)
    {
        mostrarErro('A senha deve ter no mínimo 6 caracteres');
        return;
    }
    if (dados.senha !== confirmacao)
    {
        mostrarErro('As senhas não conferem');
        return;
    }
    if (dados.nascimento > hoje)
    {
        mostrarErro('A data de nascimento não pode estar no futuro');
        return;
    }

    botao.disabled = true; // evita enviar duas vezes com cliques repetidos

    try
    {
        const resposta = await fetch('/api/auth/cadastro',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok)
        {
            mostrarErro(resultado.erro || 'Não foi possível cadastrar');
            botao.disabled = false;
            return;
        }

        campoSucesso.textContent = 'Cadastro realizado! Redirecionando para o login...';
        campoSucesso.hidden = false;

        setTimeout(function ()
        {
            window.location.href = 'index.html';
        }, 2000);
    }
    catch (erro)
    {
        mostrarErro('Não foi possível conectar ao servidor');
        botao.disabled = false;
    }
});

function mostrarErro(mensagem)
{
    campoErro.textContent = mensagem;
    campoErro.hidden = false;
}
