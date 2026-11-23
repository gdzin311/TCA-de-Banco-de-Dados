require('dotenv').config();
const express = require('express');
const pool = require('./db');
const bcryptjs = require('bcryptjs');

const app = express();
app.use(express.json());

app.get('/', (req, res) =>
    {
        res.send("testando o servidor");
    }
);

app.get('/api/investimentos', async (req, res) => 
    {
        try
        {
            let resultado = await pool.query(
                `select investimento.codigo, investimento.nome, investimento.valor, investimento.rendimento
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

const porta = process.env.PORT || 3000;

app.listen(porta, () => 
    {
        console.log(`Servidor rodando em http://localhost:${porta}`);
    }
);