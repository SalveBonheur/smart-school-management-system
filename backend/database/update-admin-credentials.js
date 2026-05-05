const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateAdminCredentials() {
    try {
        // Database connection
        const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'school_transport'
        });

        // Hash the new password
        const hashedPassword = await bcrypt.hash('Bob2010', 12);

        // Update admin credentials
        await connection.execute(
                'UPDATE admins SET email = ?, password = ? WHERE id = 1',
                ['isalvebonheur@gmail.com', hashedPassword]
        );

        console.log('Admin credentials updated successfully!');
        console.log('Email: isalvebonheur@gmail.com');
        console.log('Password: Bob2010');

        await connection.end();
    } catch (error) {
        console.error('Error updating admin credentials:', error);
    }
}

updateAdminCredentials();
