import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blood_bank',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
export const testConnection = async () => {
    const connection = await pool.getConnection();
    console.log('Database connection established');
    connection.release();
    return true;
};

// Execute query helper
export const query = async (sql, params) => {
    const [results] = await pool.execute(sql, params);
    return results;
};

// Get connection from pool
export const getConnection = () => pool.getConnection();

export default pool;
