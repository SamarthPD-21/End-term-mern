import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware: verify token and attach full user document (without password)
const isAuth = async (req, res, next) => {
  // Accept token from cookie (preferred) or Authorization header (Bearer)
  const token = req.cookies?.token || (req.headers?.authorization || "").split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // support both id and _id in token payload
    const userId = decoded.id || decoded._id;
    // attempt to load full user record so downstream handlers can check isAdmin easily
    try {
      const user = await User.findById(userId).select("-password");
      if (user) {
        req.user = user.toObject ? user.toObject() : user;
      } else {
        // fallback to token payload if user not found
        req.user = decoded;
      }
    } catch (dbErr) {
      // if DB lookup fails, still attach token payload
      console.error('auth middleware user lookup error:', dbErr);
      req.user = decoded;
    }
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isAuth;