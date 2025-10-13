// backend/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check if the request has an Authorization header, and if it starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get the token from the header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Attach the user's info to the request object (without the password)
            // This makes user data available in the next function (the actual route)
            req.user = decoded; 

            next(); // If everything is okay, proceed to the next function
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };