import User from "../models/user.model.js";

// Admin email can be set via env ADMIN_EMAIL, otherwise fallback to hardcoded
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!user.isAdmin) return res.status(403).json({ error: "Forbidden" });
    next();
  } catch (err) {
    console.error("isAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export default isAdmin;
