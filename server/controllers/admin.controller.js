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

// GET /api/admin/orders - aggregated orders across users with pagination and optional search
export const listOrders = async (req, res) => {
  try {
    const User = await import("../models/user.model.js").then((m) => m.default).catch(() => null);
    if (!User) return res.status(500).json({ error: "User model not available" });

    const { page = 1, pageSize = 20, q } = req.query;
    const p = Math.max(Number(page) || 1, 1);
    const ps = Math.max(Number(pageSize) || 20, 1);
    const skip = (p - 1) * ps;

    // Build match stage if query provided
    const matchStage = {};
    if (q && typeof q === 'string' && q.trim()) {
      const re = new RegExp(q.trim(), 'i');
      matchStage.$or = [{ orderId: re }, { status: re }, { userEmail: re }, { userName: re }];
    }

    // Aggregation: unwind orders and attach user info
    const pipeline = [
      { $unwind: { path: "$orderdata", preserveNullAndEmptyArrays: false } },
      { $replaceRoot: { newRoot: { $mergeObjects: ["$orderdata", { userEmail: "$email", userName: "$name" }] } } },
    ];

    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

    pipeline.push({ $sort: { orderDate: -1 } });

    // Facet to get paged items + total count
    pipeline.push({ $facet: { items: [{ $skip: skip }, { $limit: ps }], total: [{ $count: "count" }] } });

    const agg = await User.aggregate(pipeline).allowDiskUse(true).exec();
    const facet = Array.isArray(agg) && agg[0] ? agg[0] : { items: [], total: [] };
    const items = facet.items || [];
    const total = (Array.isArray(facet.total) && facet.total[0] && facet.total[0].count) ? facet.total[0].count : 0;

    return res.status(200).json({ total, page: p, pageSize: ps, items });
  } catch (err) {
    console.error('listOrders error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/admin/orders/:orderId/status - update an order's status across users
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const allowed = ['Pending', 'packing', 'shipping', 'delivered', 'canceled'];
    if (!status || typeof status !== 'string') return res.status(400).json({ error: 'status required' });
    const normalized = String(status).trim();
    // Normalize to a predictable casing for display
    const normDisplay = (() => {
      const s = normalized.toLowerCase();
      if (s === 'pending') return 'Pending';
      if (s === 'packing') return 'packing';
      if (s === 'shipping') return 'shipping';
      if (s === 'delivered') return 'delivered';
      if (s === 'canceled' || s === 'cancelled') return 'canceled';
      return normalized;
    })();

    if (!allowed.includes(normDisplay) && !allowed.includes(normDisplay.toLowerCase())) {
      return res.status(400).json({ error: 'invalid status' });
    }

    const User = await import('../models/user.model.js').then(m => m.default).catch(() => null);
    if (!User) return res.status(500).json({ error: 'User model not available' });

    // Find the user who owns this order
    const owner = await User.findOne({ 'orderdata.orderId': orderId });
    if (!owner) return res.status(404).json({ error: 'Order not found' });

    // Update the specific order in the user's orderdata array
    let updatedOrder = null;
    let orderIndex = -1;
    for (let i = 0; i < owner.orderdata.length; i++) {
      if (String(owner.orderdata[i].orderId) === String(orderId)) {
        orderIndex = i;
        break;
      }
    }
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not located' });

    // capture previous values to detect transitions (e.g., to canceled)
    const previousStatus = owner.orderdata[orderIndex].status;
    const previousRestocked = Boolean(owner.orderdata[orderIndex].restocked);

    // apply status update
    owner.orderdata[orderIndex].status = normDisplay;
    owner.orderdata[orderIndex].updatedAt = new Date();
    updatedOrder = owner.orderdata[orderIndex];
    if (!updatedOrder) return res.status(404).json({ error: 'Order not located' });

    // If transitioning to canceled and not yet restocked, attempt to return items to inventory
    try {
      if (String(normDisplay).toLowerCase() === 'canceled' && previousStatus !== 'canceled' && !previousRestocked) {
        const Product = await import('../models/product.model.js').then(m => m.default).catch(() => null);
        const restockMissing = [];
        if (Product) {
          for (const p of updatedOrder.products || []) {
            try {
              const prodId = String(p.productId || '');
              let query = null;
              if (prodId.match(/^[0-9a-fA-F]{24}$/)) query = { _id: prodId };
              else if (!Number.isNaN(Number(prodId))) query = { productId: Number(prodId) };
              else query = { _id: prodId };

              const found = await Product.findOneAndUpdate(query, { $inc: { quantity: Number(p.quantity || p.qty || 0) } }, { new: true }).lean();
              if (!found) restockMissing.push(p.productId || p.name || '(unknown)');
            } catch (rErr) {
              console.error('restock item failed', rErr);
              restockMissing.push(p.productId || p.name || '(unknown)');
            }
          }
        } else {
          console.error('Product model not available, cannot restock items');
        }

        // mark as restocked regardless of individual failure to avoid double attempts; record missing items in audit note
        owner.orderdata[orderIndex].restocked = true;
        owner.orderdata[orderIndex].restockedAt = new Date();

        // append short note about restock outcome to updatedOrder (saved below)
        if (restockMissing.length > 0) {
          owner.orderdata[orderIndex].restockNote = `Missing products during restock: ${restockMissing.join(', ')}`;
        }
      }
    } catch (restockErr) {
      console.error('restock processing error', restockErr);
    }

    await owner.save();

    // Optionally, create an admin audit record
    try {
      const AdminAudit = await import('../models/adminAudit.model.js').then(m => m.default).catch(() => null);
      if (AdminAudit) {
        const actorId = req.userId || req.user?._id || req.user?.id || null;
        const actorUser = actorId ? await User.findById(actorId).select('email') : null;
        await AdminAudit.create({
          actor: actorId || undefined,
          actorEmail: actorUser?.email || undefined,
          action: 'order-status',
          target: owner._id,
          targetEmail: owner.email,
          note: `Order ${orderId} set to ${normDisplay}`,
        });
      }
    } catch (auditErr) {
      console.error('audit create failed', auditErr);
    }

    return res.status(200).json({ message: 'Order status updated', order: updatedOrder, userId: owner._id, userEmail: owner.email });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
