import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const listProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    // enrich with avgRating and reviewCount for list views
    const enriched = products.map((p) => {
      const comments = p.comments || [];
      const reviewCount = comments.length;
      const avgRating = reviewCount > 0 ? comments.reduce((s, c) => s + (c.rating || 0), 0) / reviewCount : 0;
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

    const p = await Product.findById(id).select('comments');
    if (!p) return res.status(404).json({ error: 'Not found' });

    const comments = p.comments || [];
    const total = comments.length;

    // return newest comments first
    const sorted = comments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const start = (page - 1) * limit;
    const paged = sorted.slice(start, start + limit);

    // convert comments to plain objects first (preserve fields like text/createdAt)
    const pagedPlain = paged.map((c) => (c && typeof c.toObject === 'function') ? c.toObject() : JSON.parse(JSON.stringify(c)));

    // enrich comments with user profileImage/name when not present
    const userIds = Array.from(new Set(pagedPlain.filter(c => c.userId).map(c => String(c.userId))));
    let usersMap = {};
    if (userIds.length) {
      const users = await User.find({ _id: { $in: userIds } }).select('_id profileImage name userName');
      usersMap = users.reduce((acc, u) => { acc[String(u._id)] = u; return acc; }, {});
    }

    const enriched = pagedPlain.map((c) => {
      const out = { ...c };
      const u = usersMap[String(c.userId)];
      if (u) {
        if (!out.profileImage) out.profileImage = u.profileImage || null;
        if (!out.name || out.name === 'Anonymous') out.name = u.name || u.userName || out.name;
      }
      return out;
    });

    return res.status(200).json({ comments: enriched, total, page, limit });
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

    // req.user and req.userId set by auth middleware
    const commenter = {
      userId: req.userId || (req.user && (req.user.id || req.user._id)),
      name: req.user?.name || req.user?.userName || req.user?.email || 'Anonymous',
      profileImage: req.user?.profileImage || null,
      rating: Number(rating),
      text: text || '',
    };

    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: 'Not found' });

  p.comments = p.comments || [];
  p.comments.push(commenter);
  await p.save();

  // return saved comment (including generated _id when present) as a plain object
  const saved = p.comments[p.comments.length - 1] || commenter;
  const out = (saved && typeof saved.toObject === 'function') ? saved.toObject() : JSON.parse(JSON.stringify(saved));
  // ensure defaults
  out.text = out.text ?? '';
  out.rating = out.rating ?? 0;
  out.createdAt = out.createdAt ?? new Date();
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

    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: 'Not found' });

    const comment = p.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // allow owner or admin
    const actorId = req.userId || (req.user && (req.user.id || req.user._id));
    const isAdmin = req.user && req.user.isAdmin;
    if (!isAdmin && String(comment.userId) !== String(actorId)) return res.status(403).json({ error: 'Forbidden' });

    if (rating !== undefined) comment.rating = Number(rating);
    if (text !== undefined) comment.text = text;
    comment.updatedAt = new Date();

  await p.save();
  const out = (comment && typeof comment.toObject === 'function') ? comment.toObject() : JSON.parse(JSON.stringify(comment));
  return res.status(200).json({ comment: out });
  } catch (err) {
    console.error('editProductComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProductComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: 'Not found' });

    const comment = p.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const actorId = req.userId || (req.user && (req.user.id || req.user._id));
    const isAdmin = req.user && req.user.isAdmin;
    if (!isAdmin && String(comment.userId) !== String(actorId)) return res.status(403).json({ error: 'Forbidden' });

  // remove by filtering to support both Mongoose subdocuments and plain objects
  p.comments = (p.comments || []).filter((it) => String(it._id) !== String(commentId));
  await p.save();
  return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteProductComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    const comments = p.comments || [];
    const reviewCount = comments.length;
    const avgRating = reviewCount > 0 ? comments.reduce((s, c) => s + (c.rating || 0), 0) / reviewCount : 0;
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
