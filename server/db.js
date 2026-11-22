require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionTimeoutMillis: 5000,
    }
);

module.exports = pool;