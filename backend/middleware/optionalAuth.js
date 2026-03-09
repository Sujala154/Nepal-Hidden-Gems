const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token, continue as guest
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        verified: user.verified,
      };
    }
    next();
  } catch (error) {
    // If token is invalid, we still treat them as a guest or we could error.
    // Usually for optional auth, an invalid token should probably error 
    // to warn the user their session is dead, but let's just continue as guest for simplicity.
    next();
  }
};

module.exports = optionalAuth;
