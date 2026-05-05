// Update admin password to correct hash
const mysql = require('mysql2/promise');

async function updatePassword() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'school_transport'
        });
        
        // Update password hash for Bob2010
        await connection.execute(
            'UPDATE admins SET password = ? WHERE email = ?',
            ['$2a$12$jSXaYt.zLZsds1YYWii9Ie46C0KuTh9MUdow4EhiNAlfhgQ1kRYJW', 'isalvebonheur@gmail.com']
        );
        
        console.log('Password updated successfully!');
        console.log('Email: isalvebonheur@gmail.com');
        console.log('Password: Bob2010');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error updating password:', error.message);
    }
}

updatePassword();
