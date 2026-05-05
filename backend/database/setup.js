const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    let connection;
    
    try {
        // Connect without database selection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('Connected to MySQL server');

        // Create database if not exists
        await connection.query('CREATE DATABASE IF NOT EXISTS school_transport');
        console.log('Database created or already exists');

        // Use the database
        await connection.query('USE school_transport');

        // Read and execute schema file
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
        
        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                // Ignore errors for INSERT IGNORE statements on duplicate keys
                if (err.code !== 'ER_DUP_ENTRY') {
                    console.error('Error executing statement:', err.message);
                }
            }
        }

        console.log('Schema executed successfully');

        // Hash and update admin password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
            'UPDATE admins SET password = ? WHERE username = ?',
            [hashedPassword, 'admin']
        );

        console.log('Admin password set to: admin123');
        console.log('Database setup completed successfully!');

    } catch (error) {
        console.error('Database setup error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('MySQL connection closed');
        }
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup complete!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Setup failed:', err);
            process.exit(1);
        });
}

module.exports = setupDatabase;