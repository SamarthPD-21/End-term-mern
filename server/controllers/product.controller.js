import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import mongoose from 'mongoose';

export const listProducts = async (req, res) => {
  try {
    const { category, launchingSoon } = req.query;
    const filter = {};
    if (category) filter.category = category;
    // support a launchingSoon query flag to return scheduled products only
    const wantLaunching = launchingSoon === '1' || launchingSoon === 'true' || launchingSoon === 'yes';
    if (wantLaunching) {
      // products not yet launched
      filter.launched = false;
    }
    const sortBy = wantLaunching ? { launchAt: 1 } : { createdAt: -1 };
    const products = await Product.find(filter).sort(sortBy).lean();
    // enrich with avgRating and reviewCount for list views.
    // If comments have been migrated to the Comment collection, compute stats in bulk.
    const productIds = products.map(p => p._id).filter(Boolean);
    let statsMap = {};
    if (productIds.length) {
      const ag = await Comment.aggregate([
          { $match: { productId: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } } },
          { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);
      statsMap = (ag || []).reduce((acc, it) => { acc[String(it._id)] = it; return acc; }, {});
    }

    const enriched = products.map((p) => {
      const key = String(p._id);
      const s = statsMap[key];
      if (s) return { ...p, reviewCount: s.count || 0, avgRating: s.avg || 0 };
      // fallback to embedded comments if present
      const comments = p.comments || [];
      const reviewCount = comments.length;
      const avgRating = reviewCount > 0 ? comments.reduce((s2, c) => s2 + (c.rating || 0), 0) / reviewCount : 0;
      return { ...p, reviewCount, avgRating };
    });
    return res.status(200).json({ products: enriched });
  } catch (err) {
    console.error("listProducts error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const listProductComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);

    // ensure product exists
    const p = await Product.findById(id).select('_id');
    if (!p) return res.status(404).json({ error: 'Not found' });

    const filter = { productId: id };
    const total = await Comment.countDocuments(filter);

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', '_id profileImage name userName')
      .populate('replies.userId', '_id profileImage name userName')
      .lean();

    // normalize populated fields into top-level name/profileImage for client compatibility
    const out = comments.map((c) => {
      const copy = { ...c };
      if (copy.userId && typeof copy.userId === 'object') {
        copy.profileImage = copy.profileImage || copy.userId.profileImage || null;
        copy.name = copy.name || copy.userId.name || copy.userId.userName || copy.name;
        copy.userId = String(copy.userId._id || copy.userId);
      }
      // normalize replies
      if (Array.isArray(copy.replies)) {
        copy.replies = copy.replies.map(r => {
          const nr = { ...r };
          if (nr.userId && typeof nr.userId === 'object') {
            nr.profileImage = nr.profileImage || nr.userId.profileImage || null;
            nr.name = nr.name || nr.userId.name || nr.userId.userName || nr.name;
            nr.userId = String(nr.userId._id || nr.userId);
          }
          return nr;
        });
      }
      return copy;
    });

    return res.status(200).json({ comments: out, total, page, limit });
  } catch (err) {
    console.error('listProductComments error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const addProductComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });

    const p = await Product.findById(id).select('_id');
    if (!p) return res.status(404).json({ error: 'Not found' });

    const comment = await Comment.create({
      productId: id,
      userId: req.userId || (req.user && (req.user.id || req.user._id)),
      name: req.user?.name || req.user?.userName || req.user?.email || 'Anonymous',
      profileImage: req.user?.profileImage || null,
      rating: Number(rating),
      text: String(text || ''),
    });

    const out = comment.toObject ? comment.toObject() : JSON.parse(JSON.stringify(comment));
    return res.status(201).json({ comment: out });
  } catch (err) {
    console.error('addProductComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const editProductComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { rating, text } = req.body;
    if (rating !== undefined && (rating < 1 || rating > 5)) return res.status(400).json({ error: 'Invalid rating' });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // allow owner or admin
    const actorId = req.userId || (req.user && (req.user.id || req.user._id));
    const isAdmin = req.user && req.user.isAdmin;
    if (!isAdmin && String(comment.userId) !== String(actorId)) return res.status(403).json({ error: 'Forbidden' });

    if (rating !== undefined) comment.rating = Number(rating);
    if (text !== undefined) comment.text = String(text);
    comment.updatedAt = new Date();

    await comment.save();
    const out = comment.toObject ? comment.toObject() : JSON.parse(JSON.stringify(comment));
    return res.status(200).json({ comment: out });
  } catch (err) {
    console.error('editProductComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProductComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const actorId = req.userId || (req.user && (req.user.id || req.user._id));
    const isAdmin = req.user && req.user.isAdmin;
    if (!isAdmin && String(comment.userId) !== String(actorId)) return res.status(403).json({ error: 'Forbidden' });

    await Comment.deleteOne({ _id: commentId });
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteProductComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/products/:id/comments/:commentId/reply - admin reply to a comment
export const addProductCommentReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body || {};

    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // determine actor id robustly
    const actorId = req.userId || (req.user && (req.user.id || req.user._id));
    const reply = {
      userId: actorId ? new mongoose.Types.ObjectId(actorId) : undefined,
      name: req.user?.name || req.user?.userName || req.user?.email || 'User',
      profileImage: req.user?.profileImage || null,
      text: String(text || ''),
      isAdmin: Boolean(req.user?.isAdmin),
      createdAt: new Date(),
    };

    comment.replies = comment.replies || [];
    comment.replies.push(reply);
    await comment.save();

    // re-fetch with populated user fields so client gets profileImage/name without extra queries
    const updated = await Comment.findById(comment._id)
      .populate('userId', '_id profileImage name userName')
      .populate('replies.userId', '_id profileImage name userName')
      .lean();

    // normalize reply/user fields for client compatibility
    const out = { ...updated };
    if (out.userId && typeof out.userId === 'object') {
      out.profileImage = out.profileImage || out.userId.profileImage || null;
      out.name = out.name || out.userId.name || out.userId.userName || out.name;
      out.userId = String(out.userId._id || out.userId);
    }
    if (Array.isArray(out.replies)) {
      out.replies = out.replies.map(r => {
        const nr = { ...r };
        if (nr.userId && typeof nr.userId === 'object') {
          nr.profileImage = nr.profileImage || nr.userId.profileImage || null;
          nr.name = nr.name || nr.userId.name || nr.userId.userName || nr.name;
          nr.userId = String(nr.userId._id || nr.userId);
        }
        return nr;
      });
    }

    return res.status(200).json({ comment: out, reply: out.replies ? out.replies[out.replies.length - 1] : null });
  } catch (err) {
    console.error('addProductCommentReply error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCommentReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    const actorId = req.userId || (req.user && (req.user.id || req.user._id));
    const isAdmin = req.user && req.user.isAdmin;
    if (!isAdmin && String(reply.userId) !== String(actorId)) return res.status(403).json({ error: 'Forbidden' });

    // remove reply
    comment.replies = comment.replies.filter(r => String(r._id) !== String(replyId));
    await comment.save();
    return res.status(200).json({ message: 'Reply deleted' });
  } catch (err) {
    console.error('deleteCommentReply error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    // compute review stats from separate Comment collection (if used)
    const stats = await Comment.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const reviewCount = stats?.[0]?.count || 0;
    const avgRating = stats?.[0]?.avgRating || 0;
    return res.status(200).json({ product: p, reviewCount, avgRating });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, quantity } = req.body;
    const update = { name, description, price: price ? Number(price) : undefined, category, quantity: quantity ? Number(quantity) : undefined };
    // remove undefined keys
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    if (req.file && req.file.buffer) {
      const cloudinary = (await import("../config/cloudinary.js")).default;
      const upload = (buffer, folder = "products") => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(buffer);
      });
      const r = await upload(req.file.buffer);
      update.image = r.secure_url || r.url;
    }

    const p = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!p) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ product: p });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Product.findByIdAndDelete(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/products/:id/adjust - atomically adjust product.quantity by delta (admin only)
export const adjustProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body || {};
    const n = Number(delta);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n === 0) return res.status(400).json({ error: 'delta (non-zero integer) required' });

    // If decreasing stock, ensure there is enough quantity to subtract
    if (n < 0) {
      const needed = Math.abs(n);
      const p = await Product.findOneAndUpdate({ _id: id, quantity: { $gte: needed } }, { $inc: { quantity: n } }, { new: true });
      if (!p) return res.status(400).json({ error: 'Insufficient stock or product not found' });
      return res.status(200).json({ product: p });
    }

    // increasing stock - safe
    const p = await Product.findByIdAndUpdate(id, { $inc: { quantity: n } }, { new: true });
    if (!p) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ product: p });
  } catch (err) {
    console.error('adjustProductQuantity error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/products/batch - accept { ids: [...] } and return products
export const getProductsBatch = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });

    // find by _id or productId: support both string ObjectId ids and numeric productId
    const objectIds = ids.filter(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
    const numericIds = ids.filter(id => typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id))).map(Number);

    const clauses = []
    if (objectIds.length) clauses.push({ _id: { $in: objectIds } })
    if (numericIds.length) clauses.push({ productId: { $in: numericIds } })

    if (clauses.length === 0) return res.status(400).json({ error: 'No valid ids provided' })

    const products = await Product.find({ $or: clauses })

    // return as an array; client can map them by _id or productId
    return res.status(200).json({ products })
  } catch (err) {
    console.error('getProductsBatch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
