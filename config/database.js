const mysql = require('mysql2');
require('dotenv').config();

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

function getConnectionConfig() {
    return {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: false,
        authPlugins: {
            mysql_native_password: () => ({})
        }
    };
}

function createPool() {
    const config = getConnectionConfig();
    console.log('Attempting to connect to database with config:', {
        ...config,
        password: '***'
    });

    return mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    }).promise();
}

let pool = createPool();
let retryCount = 0;

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        retryCount = 0;
        return true;
    } catch (err) {
        console.error('Database connection error:', err.message);
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection in ${RETRY_INTERVAL/1000} seconds... (Attempt ${retryCount}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            pool = createPool();
            return testConnection();
        }
        throw new Error('Failed to connect to database after multiple attempts');
    }
}

testConnection().catch(err => {
    console.error('Fatal database error:', err.message);
    process.exit(1);
});

module.exports = pool;
