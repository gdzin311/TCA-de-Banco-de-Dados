# TCA de Banco de Dados: Ea-Nāṣir Investimentos
 
Trabalho conclusório da disciplina de Banco de Dados. Simulação do site de uma agência de investimentos, em que o cliente se cadastra, entra com CPF e senha e acompanha seus dados, contatos e a carteira de investimentos (renda fixa, ações, fundos imobiliários), com informações vindas do banco.
 
## Tecnologias
 
| Camada | Tecnologia |
|---|---|
| Banco de dados | PostgreSQL |
| Back-end | Node.js, Express, `pg`, `bcryptjs`, `jsonwebtoken`, `dotenv` |
| Front-end | HTML, CSS e JavaScript puros |
| Execução | Docker e Docker Compose (opcional) |
 
## Estrutura do projeto
 
```
.
├── client/                 front-end
│   ├── index.html          login
│   ├── cadastro.html       cadastro de usuário
│   ├── usuario.html        área do usuário (dados, contatos e carteira)
│   ├── style/              base.css, formulario.css, acesso.css, usuario.css
│   └── script/             login.js, cadastro.js, usuario.js
├── server/                 back-end
│   ├── app.js              rotas da API e entrega do front-end
│   ├── db.js               conexão com o PostgreSQL
│   ├── Dockerfile          imagem do servidor
│   └── package.json
├── database/
│   ├── schema.sql          criação do banco e das tabelas
│   ├── seed.sql            dados de exemplo
│   ├── diagram.bdml        modelagem do diagrama
│   └── daigram.pdf         diagrama do banco
├── docker-compose.yml      sobe o banco e o servidor juntos
└── .dockerignore
```
 
## Como executar
 
Há duas formas: com Docker (mais simples) ou instalando tudo na máquina.
 
### Opção 1: com Docker (recomendado)
 
**Pré-requisito:** Docker com o Compose (`docker --version` e `docker compose version` devem funcionar).
 
Na raiz do projeto:
 
```bash
docker compose up --build
```
 
Na primeira vez, o Docker baixa as imagens, cria o banco, executa o `schema.sql` e o `seed.sql` automaticamente e inicia o servidor. Quando aparecer `Servidor rodando em http://localhost:3000`, acesse **http://localhost:3000**.
 
| Comando | O que faz |
|---|---|
| `docker compose up --build` | constrói e inicia, com os logs na tela |
| `docker compose up -d` | inicia em segundo plano |
| `docker compose logs app` | mostra os logs do servidor |
| `docker compose down` | para e remove os containers, **mantendo os dados** |
| `docker compose down -v` | para e **apaga os dados** do banco |
 
Para acessar o banco dentro do container:
 
```bash
docker compose exec db psql -U postgres -d tca_gd
```
 
**Atenção:** os scripts SQL só executam na primeira inicialização, quando o volume do banco está vazio. Se você alterar o `schema.sql` ou o `seed.sql` depois disso, refaça tudo com:
 
```bash
docker compose down -v
docker compose up --build
```
 
**Configuração opcional.** Por padrão, a senha do banco é `postgres` e o `JWT_SECRET` é um valor de desenvolvimento, o que permite subir o projeto sem configurar nada. Para usar valores próprios, crie um arquivo `.env` **na raiz do projeto** (ao lado do `docker-compose.yml`):
 
```
DB_PASSWORD=sua-senha
JWT_SECRET=um-texto-longo-e-aleatorio
```
 
### Opção 2: sem Docker
 
**Pré-requisitos:** Node.js 18 ou superior e PostgreSQL.
 
**1. Criar o banco.** Na raiz do projeto:
 
```bash
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql
```
 
O `schema.sql` **apaga e recria** o banco `tca_gd`. Troque `postgres` pelo seu usuário do PostgreSQL, se for outro.
 
**2. Configurar o servidor.** Dentro da pasta `server`, crie um arquivo `.env`:
 
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=tca_gd
JWT_SECRET=troque-por-um-texto-longo-e-aleatorio
```
 
Para gerar um `JWT_SECRET` aleatório:
 
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
 
**3. Instalar e iniciar:**
 
```bash
cd server
npm install
node app.js
```
 
Execute o `node app.js` **de dentro da pasta `server`**, pois o `dotenv` procura o `.env` na pasta onde o comando é executado. Acesse **http://localhost:3000**.
 
Os arquivos `.env` guardam dados sensíveis e **não são versionados** (estão no `.gitignore`).
 
### Usuários de exemplo
 
O `seed.sql` cria três usuários, todos com a senha `senha123`:
 
| Nome | CPF |
|---|---|
| Maria Silva | 111.111.111-11 |
| João Souza | 222.222.222-22 |
| Ana Lima | 333.333.333-33 |
 
Também é possível criar um usuário novo pela tela de cadastro.
 
### Problemas comuns
 
| Erro | Causa provável |
|---|---|
| `port is already allocated` (Docker) | a porta 3000 está ocupada: pare o servidor que estiver rodando fora do Docker |
| `permission denied` ao usar `docker` | seu usuário não está no grupo `docker`, ou o serviço do Docker não foi iniciado |
| Alterei o SQL e nada mudou (Docker) | os scripts só rodam com o volume vazio: use `docker compose down -v` |
| `ECONNREFUSED` (sem Docker) | o PostgreSQL não está rodando, ou `DB_HOST` / `DB_PORT` estão errados |
| `password authentication failed` | `DB_USER` ou `DB_PASSWORD` incorretos |
| `secretOrPrivateKey must have a value` | falta o `JWT_SECRET` no `.env`, ou o servidor não foi reiniciado |
| `database "tca_gd" does not exist` | o `schema.sql` não foi executado |
 
Depois de qualquer mudança no `.env`, reinicie o servidor.
 
## Modelo do banco de dados
 
### Descrição das tabelas
 
| Tabela | Função |
|---|---|
| `usuario` | clientes da agência (chave: CPF) |
| `fornecedor` | instituições que oferecem os investimentos (chave: CNPJ) |
| `tipo_contato` | tipos de contato (E-mail, Telefone) |
| `contato_usuario` | contatos de cada usuário (um usuário pode ter vários) |
| `contato_fornecedor` | contatos de cada fornecedor |
| `tipo_investimento` | categorias (Renda Fixa, Ações, Fundos Imobiliários) |
| `investimento` | catálogo de produtos, cada um com tipo e fornecedor |
| `investimento_usuario` | carteira: o que cada usuário aplicou, e quando |
 
### Decisões de modelagem
 
- **`quantidade` ou `valor` na carteira.** Em `investimento_usuario`, renda fixa usa `valor` (quanto foi investido) e ações e fundos usam `quantidade` (quantas unidades). Um `check` garante que **exatamente um** dos dois seja preenchido.
- **Tabelas de tipo separadas** (`tipo_contato`, `tipo_investimento`), para não repetir texto e permitir novos tipos sem alterar a estrutura.
- **Contatos em tabela própria**, porque um usuário pode ter vários e-mails e telefones. O `unique (tipo, contato)` impede o mesmo contato em dois cadastros.
- **`on delete cascade` nos contatos.** Apagar um usuário ou fornecedor apaga seus contatos. Já a carteira **não** tem cascade: o banco impede apagar um usuário que tenha histórico de investimentos.
- **Validações no próprio banco:** formato de CPF (11 dígitos) e CNPJ (14 dígitos), valores positivos, `data_fim >= data_inicio` e lista fechada de valores para o gênero.
- **Constraints nomeadas** (`pk_`, `fk_`, `ck_`, `uq_`). O back-end usa o nome da constraint para devolver mensagens claras, como "CPF já cadastrado".
- **`rendimento`** é um percentual de referência do produto, de caráter informativo. O sistema não calcula rentabilidade.
- **Chaves automáticas** (`generated always as identity`) nas tabelas que não têm identificador natural.
## API
 
| Método | Rota | Descrição | Login |
|---|---|---|---|
| `GET` | `/api/investimentos` | catálogo de investimentos | não |
| `POST` | `/api/auth/cadastro` | cria usuário e seu e-mail | não |
| `POST` | `/api/auth/login` | devolve um token JWT | não |
| `GET` | `/api/usuario` | dados do usuário logado | sim |
| `GET` | `/api/usuario/contatos` | contatos do usuário logado | sim |
| `GET` | `/api/usuario/carteira` | investimentos do usuário logado | sim |
 
As rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`. O CPF vem de dentro do token, e não do pedido, então um usuário só acessa os próprios dados.
 
### Exemplo de consulta com `join` (carteira)
 
```sql
select investimento.nome as investimento,
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
order by investimento_usuario.data_inicio desc;
```
 
## Segurança
 
- Senhas guardadas como **hash bcrypt**, nunca em texto puro.
- Login com **token JWT** que expira em 2 horas.
- Consultas **parametrizadas** (`$1`, `$2`), contra SQL injection.
- Cadastro em **transação**: o usuário e o e-mail são gravados juntos, ou nenhum.
- O front-end exibe os dados com `textContent`, e não `innerHTML`, contra injeção de HTML.
- Segredos em `.env`, fora do repositório.
- No Docker, o banco não é exposto na máquina: só o servidor o acessa, pela rede interna do Compose.
- A senha do banco e o `JWT_SECRET` padrão do `docker-compose.yml` servem apenas para desenvolvimento. Em qualquer uso real, defina valores próprios.
## Limitações
 
- Não há simulação de compra de investimentos nem recuperação de senha.
- O login é feito apenas por CPF e senha.
## Autor
 
Desenvolvido por Artur Guadalupe Duarte Pereira (https://github.com/gdzin311) para a disciplina de Banco de Dados.
 