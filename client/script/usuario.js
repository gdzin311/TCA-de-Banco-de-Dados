const token = localStorage.getItem('token');

if (!token)
{
    window.location.href = 'index.html';
}
else
{
    carregarPagina();
}

document.getElementById('sair').addEventListener('click', function ()
{
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
});

/* ---------- buscar dados no servidor ---------- */

async function buscar(caminho)
{
    const resposta = await fetch(caminho,
    {
        headers: { Authorization: 'Bearer ' + token }
    });

    if (resposta.status === 401)
    {
        // token inválido ou expirado: volta para o login
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        window.location.href = 'index.html';
        return null;
    }

    if (!resposta.ok)
    {
        throw new Error('Erro ao buscar ' + caminho);
    }

    return resposta.json();
}

async function carregarPagina()
{
    try
    {
        const [usuario, contatos, carteira] = await Promise.all(
        [
            buscar('/api/usuario'),
            buscar('/api/usuario/contatos'),
            buscar('/api/usuario/carteira')
        ]);

        if (!usuario || !contatos || !carteira)
        {
            return;
        }

        mostrarUsuario(usuario);
        mostrarContatos(contatos);
        mostrarCarteira(carteira);
    }
    catch (erro)
    {
        console.error(erro);
        document.getElementById('subtitulo').textContent =
            'Não foi possível carregar seus dados. Tente novamente mais tarde.';
    }
}

/* ---------- mostrar na tela ---------- */

function mostrarUsuario(usuario)
{
    const primeiroNome = usuario.nome.split(' ')[0];

    document.getElementById('titulo').textContent = 'Olá, ' + primeiroNome;
    document.getElementById('dado-nome').textContent = usuario.nome;
    document.getElementById('dado-cpf').textContent = formatarCpf(usuario.cpf);
    document.getElementById('dado-nascimento').textContent = formatarData(usuario.nascimento);
    document.getElementById('dado-genero').textContent = usuario.genero;
}

function mostrarContatos(contatos)
{
    const lista = document.getElementById('lista-contatos');

    for (const contato of contatos)
    {
        const linha = document.createElement('div');

        const rotulo = document.createElement('dt');
        rotulo.textContent = contato.tipo;

        const valor = document.createElement('dd');
        valor.textContent = contato.tipo === 'Telefone'
            ? formatarTelefone(contato.contato)
            : contato.contato;

        linha.append(rotulo, valor);
        lista.append(linha);
    }
}

function mostrarCarteira(carteira)
{
    const corpo = document.getElementById('corpo-carteira');

    if (carteira.length === 0)
    {
        const linha = document.createElement('tr');
        const celula = criarCelula('Você ainda não tem investimentos.');
        celula.colSpan = 7;
        linha.append(celula);
        corpo.append(linha);
        return;
    }

    for (const item of carteira)
    {
        // renda fixa tem valor, ações e semelhantes têm quantidade
        const aplicacao = item.valor !== null
            ? formatarDinheiro(item.valor)
            : formatarQuantidade(item.quantidade);

        const encerrado = item.data_fim !== null;
        const situacao = encerrado
            ? 'Encerrado em ' + formatarData(item.data_fim)
            : 'Ativo';

        const linha = document.createElement('tr');
        linha.append(
            criarCelula(item.investimento),
            criarCelula(item.tipo),
            criarCelula(item.fornecedor),
            criarCelula(formatarRendimento(item.rendimento), 'num'),
            criarCelula(aplicacao, 'num'),
            criarCelula(formatarData(item.data_inicio)),
            criarCelula(situacao, encerrado ? 'situacao-encerrado' : 'situacao-ativo')
        );
        corpo.append(linha);
    }
}

function criarCelula(texto, classe)
{
    const celula = document.createElement('td');
    celula.textContent = texto;

    if (classe)
    {
        celula.className = classe;
    }

    return celula;
}

/* ---------- formatação ---------- */

function formatarCpf(cpf)
{
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarData(data)
{
    const [ano, mes, dia] = data.split('-');
    return dia + '/' + mes + '/' + ano;
}

function formatarTelefone(telefone)
{
    if (telefone.length === 11)
    {
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (telefone.length === 10)
    {
        return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
}

function formatarDinheiro(valor)
{
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarQuantidade(quantidade)
{
    return Number(quantidade).toLocaleString('pt-BR', { maximumFractionDigits: 4 }) + ' unidades';
}

function formatarRendimento(rendimento)
{
    return Number(rendimento).toLocaleString('pt-BR',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}
