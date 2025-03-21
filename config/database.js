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
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        connectionLimit: 10,
        waitForConnections: true,
        authPlugins: {
            mysql_native_password: () => {
                return require('mysql2/lib/auth/mysql_native_password.js')();
            }
        }
    };
}

function createPool() {
    const config = getConnectionConfig();
    console.log('Connection config:', {
        ...config,
        password: '***',
        host: config.host,
        user: config.user,
        database: config.database
    });

    return mysql.createPool(config).promise();
}

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        console.log('Database connected successfully');
        connection.release();
        retryCount = 0;
        return true;
    } catch (err) {
        console.error('Detailed connection error:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState
        });
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection in ${RETRY_INTERVAL/1000} seconds... (Attempt ${retryCount}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            pool = createPool();
            return testConnection();
        }
        throw err;
    }
}

let pool = createPool();
let retryCount = 0;

testConnection().catch(err => {
    console.error('Fatal database error:', err);
    process.exit(1);
});

module.exports = pool;
