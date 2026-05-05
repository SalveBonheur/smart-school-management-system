// Test database connection
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test with your database structure
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'school_transport'
        });
        
        console.log('✅ Connection successful!');
        
        // Test admin table query
        const [admins] = await connection.execute(
            'SELECT * FROM admins WHERE email = ?',
            ['isalvebonheur@gmail.com']
        );
        
        console.log('📋 Admin records found:', admins.length);
        
        if (admins.length > 0) {
            console.log('✅ Admin email found in database');
            console.log('📧 Admin ID:', admins[0].id);
            console.log('👤 Admin Name:', admins[0].full_name);
            console.log('🔑 Password hash (first 20 chars):', admins[0].password.substring(0, 20) + '...');
        } else {
            console.log('❌ Admin email not found in database');
            console.log('💡 Try running: INSERT INTO admins (email, password, full_name) VALUES ("isalvebonheur@gmail.com", "your_hashed_password", "Your Name")');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Possible solutions:');
        console.log('   1. Check if MySQL service is running');
        console.log('   2. Verify database name: school_transport');
        console.log('   3. Check MySQL user permissions');
        console.log('   4. Verify password for MySQL root user');
    }
}

testConnection();
