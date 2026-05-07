import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_school_transport_secret_key_2024';

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

// Authorize specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required.' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Insufficient permissions to access this resource.' 
            });
        }

        next();
    };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const verified = jwt.verify(token, JWT_SECRET);
            req.user = verified;
        } catch (error) {
            // Token invalid, but continue without authentication
        }
    }

    next();
};

export {
    generateToken,
    authenticateToken,
    authorizeRoles,
    optionalAuth,
    JWT_SECRET
};