import Product from "../models/product.model.js";
import Counter from "../models/counter.model.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer, folder = "products") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, launchAt } = req.body;
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let imageUrl = null;
    if (req.file && req.file.buffer) {
      const r = await uploadToCloudinary(req.file.buffer, "products");
      imageUrl = r.secure_url || r.url;
    }

    // compute productId atomically per-category using a counters collection
    const counter = await Counter.findOneAndUpdate(
      { category },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const productId = counter.seq;

    // determine launched status based on launchAt if present
    let parsedLaunch = null;
    if (launchAt) {
      const d = new Date(launchAt);
      if (!isNaN(d.getTime())) parsedLaunch = d;
    }

    const product = await Product.create({
      name,
      description,
      image: imageUrl || req.body.image || "",
      price: Number(price),
      category,
      quantity: Number(quantity),
      productId,
      launchAt: parsedLaunch || undefined,
      launched: parsedLaunch ? parsedLaunch <= new Date() : true,
      // record who created this product (if available)
      createdBy: req.userId || req.user?._id || req.user?.id || undefined,
      createdByEmail: req.user?.email || undefined,
    });

    return res.status(201).json({ product });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await import("../models/user.model.js").then(m => m.default).catch(() => null);
    if (!user) return res.status(500).json({ error: "User model not available" });

    const target = await user.findOne({ email });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.isAdmin) return res.status(400).json({ error: "User is already an admin" });

    target.isAdmin = true;
    await target.save();
    // create audit record (best-effort)
    try {
      const AdminAudit = await import("../models/adminAudit.model.js").then(m => m.default).catch(() => null);
      if (AdminAudit) {
        const actorId = req.userId || req.user?._id || req.user?.id || null;
        const actorUser = actorId ? await user.findById(actorId).select("email") : null;
        const reason = req.body?.reason || req.body?.note || undefined;
        await AdminAudit.create({
          actor: actorId || undefined,
          actorEmail: actorUser?.email || undefined,
          action: "promote",
          target: target._id,
          targetEmail: target.email,
          note: reason,
        });
      }
    } catch (auditErr) {
      console.error("Admin audit create error:", auditErr);
    }

    const out = target.toObject();
    delete out.password;
    return res.status(200).json({ message: "User promoted to admin", user: out });
  } catch (err) {
    console.error("makeAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const demoteAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await import("../models/user.model.js").then(m => m.default).catch(() => null);
    if (!user) return res.status(500).json({ error: "User model not available" });

    const target = await user.findOne({ email });
    if (!target) return res.status(404).json({ error: "User not found" });

    // Prevent an admin from demoting themselves to avoid accidental lockout
    const actorId = req.userId || req.user?._id || req.user?.id;
    if (actorId && String(target._id) === String(actorId)) {
      return res.status(400).json({ error: "You cannot remove admin from yourself" });
    }

    if (!target.isAdmin) return res.status(400).json({ error: "User is not an admin" });

    target.isAdmin = false;
    await target.save();
    // create audit record (best-effort)
    try {
      const AdminAudit = await import("../models/adminAudit.model.js").then(m => m.default).catch(() => null);
      if (AdminAudit) {
        const actorId = req.userId || req.user?._id || req.user?.id || null;
        const actorUser = actorId ? await user.findById(actorId).select("email") : null;
        const reason = req.body?.reason || req.body?.note || undefined;
        await AdminAudit.create({
          actor: actorId || undefined,
          actorEmail: actorUser?.email || undefined,
          action: "demote",
          target: target._id,
          targetEmail: target.email,
          note: reason,
        });
      }
    } catch (auditErr) {
      console.error("Admin audit create error:", auditErr);
    }

    const out = target.toObject();
    delete out.password;
    return res.status(200).json({ message: "Admin rights revoked", user: out });
  } catch (err) {
    console.error("demoteAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/admin/users - list users (for admin panel). returns basic fields only
export const listUsers = async (req, res) => {
  try {
    const User = await import("../models/user.model.js").then(m => m.default).catch(() => null);
    if (!User) return res.status(500).json({ error: "User model not available" });
    const users = await User.find({}).select("name email isAdmin profileImage").lean();
    return res.status(200).json({ users });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/admin/audits - list admin audit records (admin only)
export const listAudits = async (req, res) => {
  try {
    const AdminAudit = await import("../models/adminAudit.model.js").then(m => m.default).catch(() => null);
    if (!AdminAudit) return res.status(500).json({ error: "AdminAudit model not available" });

    const { page = 1, pageSize = 50, q } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = {};
    if (q && typeof q === 'string' && q.trim()) {
      const re = new RegExp(q.trim(), 'i');
      filter.$or = [{ actorEmail: re }, { targetEmail: re }, { action: re }, { note: re }];
    }

    const total = await AdminAudit.countDocuments(filter);
    const items = await AdminAudit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)).lean();
    return res.status(200).json({ total, page: Number(page), pageSize: Number(pageSize), items });
  } catch (err) {
    console.error('listAudits error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
