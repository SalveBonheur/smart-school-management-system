/**
 * Error Handler Middleware
 * Comprehensive error handling for the Smart School Transport API
 */

import { logger } from './logger.js';

// Error classes for different types of errors
class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.field = field;
    }
}

class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

class ConflictError extends Error {
    constructor(message = 'Resource conflict') {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized access') {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;
    }
}

class ForbiddenError extends Error {
    constructor(message = 'Forbidden access') {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

class DatabaseError extends Error {
    constructor(message = 'Database operation failed') {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = 500;
    }
}

class ExternalServiceError extends Error {
    constructor(message = 'External service unavailable') {
        super(message);
        this.name = 'ExternalServiceError';
        this.statusCode = 503;
    }
}

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error details
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new NotFoundError(message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ConflictError(message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ValidationError(message.join('. '));
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new UnauthorizedError(message);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new UnauthorizedError(message);
    }

    // MySQL errors
    if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                error = new ConflictError('Duplicate entry found');
                break;
            case 'ER_NO_SUCH_TABLE':
                error = new NotFoundError('Table not found');
                break;
            case 'ER_NO_SUCH_COLUMN':
                error = new ValidationError('Invalid column specified');
                break;
            case 'ER_PARSE_ERROR':
                error = new ValidationError('Invalid SQL syntax');
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                error = new DatabaseError('Database access denied');
                break;
            case 'ER_CON_COUNT_ERROR':
                error = new DatabaseError('Too many database connections');
                break;
            case 'ER_LOCK_WAIT_TIMEOUT':
                error = new DatabaseError('Database lock timeout');
                break;
            case 'ER_LOCK_DEADLOCK':
                error = new DatabaseError('Database deadlock detected');
                break;
            default:
                if (err.code.startsWith('ER_')) {
                    error = new DatabaseError(err.message || 'Database error occurred');
                }
        }
    }

    // Custom error handling
    if (err.name === 'ValidationError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message,
                field: error.field
            }
        });
    }

    if (err.name === 'NotFoundError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message
            }
        });
    }

    if (err.name === 'ConflictError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message
            }
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message
            }
        });
    }

    if (err.name === 'ForbiddenError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message
            }
        });
    }

    if (err.name === 'DatabaseError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message
            }
        });
    }

    if (err.name === 'ExternalServiceError') {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                name: error.name,
                message: error.message
            }
        });
    }

    // Default error response
    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            name: err.name || 'InternalServerError',
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

// Validation error formatter
const formatValidationError = (errors) => {
    return {
        name: 'ValidationError',
        message: 'Validation failed',
        details: errors.map(error => ({
            field: error.path || error.field,
            message: error.msg || error.message,
            value: error.value
        }))
    };
};

// Database error formatter
const formatDatabaseError = (error) => {
    return {
        name: 'DatabaseError',
        message: error.message || 'Database operation failed',
        code: error.code,
        sql: error.sql
    };
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
    res.status(429).json({
        success: false,
        error: {
            name: 'RateLimitError',
            message: 'Too many requests, please try again later',
            retryAfter: res.get('Retry-After')
        }
    });
};

// CORS error handler
const corsErrorHandler = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            success: false,
            error: {
                name: 'CSRFError',
                message: 'Invalid CSRF token'
            }
        });
    }
    next(err);
};

export {
    errorHandler,
    asyncHandler,
    notFound,
    ValidationError,
    NotFoundError,
    ConflictError,
    UnauthorizedError,
    ForbiddenError,
    DatabaseError,
    ExternalServiceError,
    formatValidationError,
    formatDatabaseError,
    rateLimitHandler,
    corsErrorHandler
};