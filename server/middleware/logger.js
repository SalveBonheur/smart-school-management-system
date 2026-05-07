/**
 * Logger Middleware
 * Advanced logging system for the Smart School Transport API
 */

import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { fileURLToPath } from 'url';

const { format } = winston;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
    format.prettyPrint()
);

// Console format for development
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'smart-school-transport' },
    transports: [
        // Error log file
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        
        // Combined log file
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        
        // Database operations log
        new winston.transports.File({
            filename: path.join(logsDir, 'database.log'),
            level: 'http',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        
        // Security log
        new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request details
    logger.http('HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        requestId: req.id || generateRequestId()
    });

    // Capture response details
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - start;
        
        logger.http('HTTP Response', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: body ? body.length : 0,
            timestamp: new Date().toISOString()
        });

        return originalSend.call(this, body);
    };

    next();
};

// Security event logger
const securityLogger = {
    loginAttempt: (username, success, ip, userAgent) => {
        logger.warn('Login Attempt', {
            username,
            success,
            ip,
            userAgent,
            timestamp: new Date().toISOString()
        });
    },

    unauthorizedAccess: (req, resource) => {
        logger.warn('Unauthorized Access Attempt', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            method: req.method,
            resource,
            timestamp: new Date().toISOString()
        });
    },

    suspiciousActivity: (description, details) => {
        logger.warn('Suspicious Activity', {
            description,
            details,
            timestamp: new Date().toISOString()
        });
    },

    dataAccess: (userId, resource, action) => {
        logger.info('Data Access', {
            userId,
            resource,
            action,
            timestamp: new Date().toISOString()
        });
    }
};

// Database operation logger
const databaseLogger = {
    query: (query, params, duration) => {
        logger.http('Database Query', {
            query: query.replace(/\s+/g, ' ').trim(),
            params,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
    },

    error: (error, query, params) => {
        logger.error('Database Error', {
            error: error.message,
            query: query ? query.replace(/\s+/g, ' ').trim() : null,
            params,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    },

    connection: (status, details) => {
        logger.info('Database Connection', {
            status,
            details,
            timestamp: new Date().toISOString()
        });
    }
};

// Audit logger for compliance
const auditLogger = {
    userAction: (userId, action, resource, details) => {
        logger.info('User Action', {
            userId,
            action,
            resource,
            details,
            timestamp: new Date().toISOString()
        });
    },

    dataModification: (userId, table, action, recordId, changes) => {
        logger.info('Data Modification', {
            userId,
            table,
            action,
            recordId,
            changes,
            timestamp: new Date().toISOString()
        });
    },

    systemEvent: (event, details) => {
        logger.info('System Event', {
            event,
            details,
            timestamp: new Date().toISOString()
        });
    }
};

// Performance logger
const performanceLogger = {
    apiResponseTime: (endpoint, method, duration, statusCode) => {
        if (duration > 1000) { // Log slow requests
            logger.warn('Slow API Response', {
                endpoint,
                method,
                duration: `${duration}ms`,
                statusCode,
                timestamp: new Date().toISOString()
            });
        }
    },

    memoryUsage: () => {
        const usage = process.memoryUsage();
        logger.info('Memory Usage', {
            rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(usage.external / 1024 / 1024)} MB`,
            timestamp: new Date().toISOString()
        });
    },

    systemHealth: (health) => {
        logger.info('System Health', {
            ...health,
            timestamp: new Date().toISOString()
        });
    }
};

// Helper function to generate request ID
function generateRequestId() {
    return Math.random().toString(36).substr(2, 9);
}

// Export logger and utilities
export {
    logger,
    requestLogger,
    securityLogger,
    databaseLogger,
    auditLogger,
    performanceLogger
};