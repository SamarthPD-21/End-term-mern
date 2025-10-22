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
    const { name, description, price, category, quantity } = req.body;
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

    const product = await Product.create({
      name,
      description,
      image: imageUrl || req.body.image || "",
      price: Number(price),
      category,
      quantity: Number(quantity),
      productId,
    });

    return res.status(201).json({ product });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
