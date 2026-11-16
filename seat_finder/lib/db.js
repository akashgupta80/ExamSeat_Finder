const mysql = require("mysql2/promise");

const requiredVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
    console.error("Missing environment variables: " + missingVars.join(", "));
}

function buildSslOptions() {
    // Encryption is ON by default. Turn it off only for a local test database with DB_SSL=false.
    if (process.env.DB_SSL === "false") {
        return undefined;
    }

    const options = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    };

    // Some providers (for example Aiven) give you a CA certificate. Paste its text into DB_CA.
    if (process.env.DB_CA) {
        options.ca = process.env.DB_CA.replace(/\\n/g, "\n");
    }

    return options;
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: buildSslOptions(),

    waitForConnections: true,
    connectionLimit: 3,
    maxIdle: 3,
    idleTimeout: 20000,
    queueLimit: 20,
    connectTimeout: 8000,
    enableKeepAlive: true
});

module.exports = pool;