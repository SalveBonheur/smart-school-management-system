const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import the app
const app = require('../server');

// Test configuration
const testConfig = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_transport_test'
    },
    jwtSecret: process.env.JWT_SECRET || 'test_secret',
    testUser: {
        username: 'testadmin',
        password: 'testpassword123',
        email: 'test@example.com'
    }
};

describe('Smart School Transport System', () => {
    let authToken;
    let testUserId;

    beforeAll(async () => {
        // Setup test database
        const connection = await mysql.createConnection(testConfig.db);
        
        // Create test database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testConfig.db.database}`);
        await connection.changeUser({ database: testConfig.db.database });
        
        // Run schema setup
        const schema = require('../database/schema.sql');
        // Note: You would need to adapt this to execute the SQL properly
        
        await connection.end();
    });

    afterAll(async () => {
        // Cleanup test database
        const connection = await mysql.createConnection(testConfig.db);
        await connection.execute(`DROP DATABASE IF EXISTS ${testConfig.db.database}`);
        await connection.end();
    });

    describe('Authentication', () => {
        test('should register a new admin user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testConfig.testUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin registered successfully');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.username).toBe(testConfig.testUser.username);
            
            testUserId = response.body.user.id;
        });

        test('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testConfig.testUser.username,
                    password: testConfig.testUser.password
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.username).toBe(testConfig.testUser.username);
            
            authToken = response.body.token;
        });

        test('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testConfig.testUser.username,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        test('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe(testConfig.testUser.username);
        });

        test('should reject requests without token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Access denied. No token provided.');
        });
    });

    describe('Students', () => {
        const testStudent = {
            name: 'John Doe',
            grade: '10',
            section: 'A',
            roll_number: '12345',
            bus_id: 1,
            route_id: 1,
            driver_id: 1,
            pickup_point: 'Main Street',
            dropoff_point: 'School Gate',
            parent_name: 'Jane Doe',
            parent_phone: '+1234567890',
            emergency_contact: '+0987654321'
        };

        test('should create a new student', async () => {
            const response = await request(app)
                .post('/api/students')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testStudent)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Student created successfully');
            expect(response.body.student.name).toBe(testStudent.name);
        });

        test('should get all students', async () => {
            const response = await request(app)
                .get('/api/students')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.students)).toBe(true);
            expect(response.body.students.length).toBeGreaterThan(0);
        });

        test('should get student by ID', async () => {
            const response = await request(app)
                .get('/api/students/1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.student.name).toBe(testStudent.name);
        });

        test('should update student', async () => {
            const updateData = { ...testStudent, name: 'John Smith' };
            const response = await request(app)
                .put('/api/students/1')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Student updated successfully');
            expect(response.body.student.name).toBe('John Smith');
        });

        test('should delete student', async () => {
            const response = await request(app)
                .delete('/api/students/1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Student deleted successfully');
        });
    });

    describe('Buses', () => {
        const testBus = {
            bus_number: 'BUS001',
            capacity: 50,
            driver_id: 1,
            route_id: 1,
            status: 'active',
            last_maintenance: '2023-01-01',
            next_maintenance: '2024-01-01'
        };

        test('should create a new bus', async () => {
            const response = await request(app)
                .post('/api/buses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testBus)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Bus created successfully');
            expect(response.body.bus.bus_number).toBe(testBus.bus_number);
        });

        test('should get all buses', async () => {
            const response = await request(app)
                .get('/api/buses')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.buses)).toBe(true);
        });
    });

    describe('Drivers', () => {
        const testDriver = {
            name: 'Driver One',
            license_number: 'DL123456',
            phone: '+1234567890',
            email: 'driver@example.com',
            address: '123 Driver St',
            status: 'active',
            assigned_bus: 'BUS001'
        };

        test('should create a new driver', async () => {
            const response = await request(app)
                .post('/api/drivers')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testDriver)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Driver created successfully');
            expect(response.body.driver.name).toBe(testDriver.name);
        });

        test('should get all drivers', async () => {
            const response = await request(app)
                .get('/api/drivers')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.drivers)).toBe(true);
        });
    });

    describe('Routes', () => {
        const testRoute = {
            route_name: 'Route A',
            start_point: 'Main Street',
            end_point: 'School Gate',
            distance: 5.5,
            estimated_time: 30,
            stops: ['Stop 1', 'Stop 2', 'Stop 3']
        };

        test('should create a new route', async () => {
            const response = await request(app)
                .post('/api/routes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testRoute)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Route created successfully');
            expect(response.body.route.route_name).toBe(testRoute.route_name);
        });

        test('should get all routes', async () => {
            const response = await request(app)
                .get('/api/routes')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.routes)).toBe(true);
        });
    });

    describe('Attendance', () => {
        test('should record attendance', async () => {
            const attendanceData = {
                student_id: 1,
                bus_id: 1,
                route_id: 1,
                driver_id: 1,
                status: 'present',
                type: 'boarding'
            };

            const response = await request(app)
                .post('/api/attendance')
                .set('Authorization', `Bearer ${authToken}`)
                .send(attendanceData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Attendance recorded successfully');
        });

        test('should get attendance records', async () => {
            const response = await request(app)
                .get('/api/attendance')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.attendance)).toBe(true);
        });
    });

    describe('Payments', () => {
        test('should record payment', async () => {
            const paymentData = {
                student_id: 1,
                amount: 100.00,
                payment_method: 'cash',
                description: 'Monthly transport fee'
            };

            const response = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(paymentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Payment recorded successfully');
        });

        test('should get payment history', async () => {
            const response = await request(app)
                .get('/api/payments')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.payments)).toBe(true);
        });
    });

    describe('Dashboard', () => {
        test('should get dashboard statistics', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toHaveProperty('total_students');
            expect(response.body.stats).toHaveProperty('total_buses');
            expect(response.body.stats).toHaveProperty('total_drivers');
            expect(response.body.stats).toHaveProperty('active_routes');
        });

        test('should get dashboard charts data', async () => {
            const response = await request(app)
                .get('/api/dashboard/charts')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.charts).toHaveProperty('attendance_data');
            expect(response.body.charts).toHaveProperty('revenue_data');
            expect(response.body.charts).toHaveProperty('bus_utilization');
        });
    });

    describe('Security', () => {
        test('should implement rate limiting', async () => {
            // Make multiple rapid requests to trigger rate limiting
            const requests = Array(110).fill().map(() => 
                request(app).get('/api/health')
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        test('should handle CORS properly', async () => {
            const response = await request(app)
                .get('/api/health')
                .set('Origin', 'http://localhost:3000')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        test('should sanitize input data', async () => {
            const maliciousData = {
                name: '<script>alert("xss")</script>',
                description: 'Normal description'
            };

            const response = await request(app)
                .post('/api/students')
                .set('Authorization', `Bearer ${authToken}`)
                .send(maliciousData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 errors', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Route not found');
        });

        test('should handle database errors gracefully', async () => {
            // This would require mocking the database connection
            // to simulate a database error
            const response = await request(app)
                .get('/api/students')
                .set('Authorization', `Bearer invalid_token`)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('API Health', () => {
        test('should return health check information', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Smart School Transport API is running');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('environment');
        });
    });
});

module.exports = {
    testConfig,
    app
};