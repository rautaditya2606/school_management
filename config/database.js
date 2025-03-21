const mysql = require('mysql2');
require('dotenv').config();

function getConnectionConfig() {
    const url = new URL(process.env.MYSQL_URL);
    console.log('Connecting to database:', url.hostname);
    
    return {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        port: url.port,
        ssl: { rejectUnauthorized: false }
    };
}

const config = getConnectionConfig();
const pool = mysql.createPool(config).promise();

// Test connection immediately
pool.query('SELECT 1')
    .then(() => console.log('Database connected successfully'))
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

module.exports = pool;
