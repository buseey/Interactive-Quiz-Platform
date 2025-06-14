const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            console.log("🎯 Gelen Token:", token);  // TOKEN LOGU

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log("✅ Token decode edildi:", decoded);  // DECODE LOGU

            req.user = await User.findById(decoded.id).select('-password');
            console.log("🙋 Kullanıcı bulundu:", req.user);  // USER LOGU

            next();
        } catch (error) {
            console.error("❌ Token doğrulama hatası:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
