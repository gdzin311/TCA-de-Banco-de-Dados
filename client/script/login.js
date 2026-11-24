const formulario = document.getElementById('form-login');
const campoErro = document.getElementById('erro');

formulario.addEventListener('submit', async function (evento)
{
    evento.preventDefault();
    campoErro.hidden = true;

    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    try
    {
        const resposta = await fetch('/api/auth/login',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok)
        {
            mostrarErro(dados.erro || 'Não foi possível entrar');
            return;
        }

        localStorage.setItem('token', dados.token);
        localStorage.setItem('nome', dados.nome);
        window.location.href = 'usuario.html';
    }
    catch (erro)
    {
        mostrarErro('Não foi possível conectar ao servidor');
    }
});

function mostrarErro(mensagem)
{
    campoErro.textContent = mensagem;
    campoErro.hidden = false;
}
