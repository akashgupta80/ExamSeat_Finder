const mysql = require("mysql2/promise");

const ssl = {
    rejectUnauthorized: true,
    ...(process.env.DB_CA_CERT
        ? {
            ca: process.env.DB_CA_CERT.replace(/\\n/g, "\n")
        }
        : {})
};

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    ssl,

    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0
});

module.exports = pool;
