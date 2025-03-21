const mysql = require('mysql2');
require('dotenv').config();

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

function getConnectionConfig() {
    if (process.env.NODE_ENV === 'production' && process.env.MYSQL_URL) {
        const url = new URL(process.env.MYSQL_URL);
        return {
            host: url.hostname,
            user: url.username,
            password: url.password,
            database: url.pathname.substring(1),
            port: url.port || 3306,
            ssl: {
                rejectUnauthorized: false
            },
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }

    // Fallback to local config
    return {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        connectTimeout: 10000,
        waitForConnections: true,
        connectionLimit: 10
    };
}

async function testConnection(retryCount = 0) {
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
    
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (err) {
        console.error('Connection attempt failed:', {
            attempt: retryCount + 1,
            maxRetries: MAX_RETRIES,
            delay: delay + 'ms',
            error: err.message
        });

        if (retryCount < MAX_RETRIES) {
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return testConnection(retryCount + 1);
        }
        throw new Error(`Failed to connect after ${MAX_RETRIES} attempts`);
    }
}

const pool = mysql.createPool(getConnectionConfig()).promise();

// Initial connection test
testConnection().catch(err => {
    console.error('Fatal database error:', err.message);
    process.exit(1);
});

module.exports = pool;
