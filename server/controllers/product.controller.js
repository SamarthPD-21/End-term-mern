import Product from "../models/product.model.js";

export const listProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (err) {
    console.error("listProducts error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ product: p });
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
