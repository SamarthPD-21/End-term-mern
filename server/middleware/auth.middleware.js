import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  // Accept token from cookie (preferred) or Authorization header (Bearer)
  const token = req.cookies?.token || (req.headers?.authorization || "").split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // support both id and _id in token payload
    req.userId = decoded.id || decoded._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isAuth;