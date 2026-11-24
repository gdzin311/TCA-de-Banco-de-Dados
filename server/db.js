require('dotenv').config();
const { Pool, types } = require('pg');

types.setTypeParser(1082, (valor) => valor);//evita convbersão de fuso


const pool = new Pool(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionTimeoutMillis: 5000,
    }
);

module.exports = pool;