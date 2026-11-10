
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 10220),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    ssl: process.env.DB_SSL === "true"
        ? { rejectUnauthorized: true }
        : undefined,

    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0
});

module.exports = pool;
