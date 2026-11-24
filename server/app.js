require('dotenv').config();
const express = require('express');
const pool = require('./db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

function autenticar(req, res, next)
{
    const cabecalho = req.headers.authorization || '';
    const [tipo, token] = cabecalho.split(' ');

    if (tipo !== 'Bearer' || !token)
    {
        return res.status(401).json({ erro: 'Token não informado' });
    }

    let dados;
    try
    {
        dados = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(erro)
    {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    req.cpf = dados.cpf;
    next();
};

app.get('/api/investimentos', async (req, res) => 
    {
        try
        {
            let resultado = await pool.query(
                `select investimento.codigo, investimento.nome, investimento.valor, investimento.rendimento,
                tipo.nome as tipo, fornecedor.nome as fornecedor
                from investimento
                    join tipo_investimento tipo 
                        on tipo.codigo = investimento.tipo
                    join fornecedor 
                        on fornecedor.cnpj = investimento.fornecedor
                order by 1`
            );

            res.json(resultado.rows);
        }
        catch(erro)
        {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao buscar investimentos' });
        }
    }
)

app.post('/api/auth/cadastro', async (req, res) => 
    {
        const {nome, email, senha, nascimento, genero} = req.body || {};
        const cpf = String((req.body || {}).cpf || '').replace(/\D/g, '')//regex para substituir todas as ocorrencais de caracteres n numericos para strings vazias

        if (cpf.length !== 11) 
        {
            return res.status(400).json({ erro: 'CPF deve ter 11 dígitos' });
        }

        if (!nome || !nascimento || !genero) 
        {
            return res.status(400).json({ erro: 'Preencha todos os campos' });
        }

        if (!senha || senha.length < 6) 
        {
            return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres' });
        }

        if (!email || !email.includes('@')) 
        {
            return res.status(400).json({ erro: 'E-mail inválido' });
        }

        const client = await pool.connect();
        try
        {
            await client.query('begin');

            const senhaHash = await bcryptjs.hash(senha, 10);

            await client.query
            (
                `insert into usuario (cpf, nome, senha_hash, nascimento, genero)
                values($1, $2, $3, $4, $5)`, [cpf, nome, senhaHash, nascimento, genero]
            );

            await client.query
            (
               `insert into contato_usuario(usuario, tipo, contato)
               values($1, (select codigo from tipo_contato where nome = 'Email'), $2)`, [cpf, email.trim().toLowerCase()]
            );

            await client.query('commit');
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
        }
        catch(erro)
        {
            await client.query('rollback');

            if(erro.code == '23505')
            {
                const mensagens = {
                    pk_usuario: 'CPF já cadastrado',
                    uq_contato_usuario: 'E-mail já cadastrado',
                };
                return res.status(409).json({ erro: mensagens[erro.constraint] || 'Registro duplicado' });
            }

            if (erro.code === '23514')
            {        
                return res.status(400).json({erro: 'dados inválidos, confira CPF, nascimento e genero'});
            }

            console.error(erro);
            res.status(500).json({erro: 'erro ao cadastrar usuário'});
        }
        finally
        {
            client.release(); //libera a conexão do pool para reuso
        }
    } 
)

app.post('/api/auth/login', async (req, res) =>
    {
        const {senha} = req.body || {};
        const cpf = String((req.body || {}).cpf || '').replace(/\D/g, '');

        if(!cpf || !senha)
        {
            return res.status(400).json({erro: 'informe a senha e o cpf'})
        }

        try
        {
            const resultado = await pool.query(`select cpf, nome, senha_hash from usuario where cpf = $1`,[cpf]);

            const usuario = resultado.rows[0];

            const senhaOk = usuario && await bcryptjs.compare(senha, usuario.senha_hash);

            if(!senhaOk)
            {
                return res.status(401).json({erro: 'cpf ou senha errados'});
            }

            const token = jwt.sign({ cpf: usuario.cpf }, process.env.JWT_SECRET, { expiresIn: '2h' });

            res.json({token, nome: usuario.nome})
        }
        catch(erro)
        {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao fazer login' });
        }
    } 
)

app.get('/api/usuario', autenticar, async (req, res) =>
    {
        try
        {
            const resultado = await pool.query(
                `select cpf, nome, nascimento, genero
                from usuario
                where cpf = $1`, [req.cpf]
            );

            if (!resultado.rows[0])
            {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            res.json(resultado.rows[0]);
        }
        catch(erro)
        {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao buscar usuário' });
        }
    }
)

app.get('/api/usuario/contatos', autenticar, async (req, res) =>
    {
        try
        {
            const resultado = await pool.query(
                `select tipo_contato.nome as tipo, contato_usuario.contato
                from contato_usuario
                    join tipo_contato
                        on tipo_contato.codigo = contato_usuario.tipo
                where contato_usuario.usuario = $1
                order by tipo_contato.nome, contato_usuario.contato`, [req.cpf]
            );

            res.json(resultado.rows);
        }
        catch(erro)
        {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao buscar contatos' });
        }
    }
)

app.get('/api/usuario/carteira', autenticar, async (req, res) =>
    {
        try
        {
            const resultado = await pool.query(
                `select investimento.nome as investimento,
                    tipo_investimento.nome as tipo,
                    fornecedor.nome as fornecedor,
                    investimento.rendimento,
                    investimento_usuario.quantidade,
                    investimento_usuario.valor,
                    investimento_usuario.data_inicio,
                    investimento_usuario.data_fim
                from investimento_usuario
                    join investimento
                        on investimento.codigo = investimento_usuario.investimento
                    join tipo_investimento
                        on tipo_investimento.codigo = investimento.tipo
                    join fornecedor
                        on fornecedor.cnpj = investimento.fornecedor
                where investimento_usuario.usuario = $1
                order by investimento_usuario.data_inicio desc`, [req.cpf]
            );

            res.json(resultado.rows);
        }
        catch(erro)
        {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao buscar carteira' });
        }
    }
)

const porta = process.env.PORT || 3000;

app.listen(porta, () => 
    {
        console.log(`Servidor rodando em http://localhost:${porta}`);
    }
);