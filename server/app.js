require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();

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
                `select investimento.codigo, investimento.nome,
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

const porta = process.env.PORT || 3000;

app.listen(porta, () => 
    {
        console.log(`Servidor rodando em http://localhost:${porta}`);
    }
);