import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

// Helper to upload buffer to cloudinary using upload_stream
const uploadToCloudinary = (buffer, folder = "profiles") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

export const getCurrentUser = async (req, res) => {
  const {userId} = req;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadProfileImage = async (req, res) => {
  const { userId } = req;
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Log some useful debug info about the incoming file
    console.log("Uploading profile image for user:", userId);
    console.log("file originalname:", req.file.originalname, "mimetype:", req.file.mimetype, "size:", req.file.size);

    const uploadResult = await uploadToCloudinary(req.file.buffer, "profiles");
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.profileImage = uploadResult.secure_url;
    await user.save();
  // Return updated user (exclude password)
  const safeUser = await User.findById(userId).select("-password");
    return res.status(200).json({ message: "Profile image uploaded", image: uploadResult.secure_url, user: safeUser });
  } catch (error) {
    console.error("Upload error:", error);
    // Return the error message to the client for easier debugging in dev
    const message = error?.message || "Failed to upload image";
    return res.status(500).json({ error: message, details: error });
  }
};

export const editCurrentUser = async (req, res) => {
  const { userId } = req;
  const { name, email } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.name = name;
    user.email = email;
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addUserAddress = async (req, res) => {
  const { userId } = req;
  const { street, city, state, postalCode, country, phone } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.addressdata.push({ street, city, state, postalCode, country, phone });
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUserAddress = async (req, res) => {
  const { userId } = req;
  const { addressId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.addressdata.pull(addressId);
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addWishlistItem = async (req, res) => {
  const { userId } = req;
  const { productId, name, price, image } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'productId required' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlistdata = user.wishlistdata || [];
    const exists = user.wishlistdata.some(w => String(w.productId) === String(productId));
    if (!exists) {
      user.wishlistdata.push({ productId: String(productId), name: name || '', price: Number(price) || 0, image: image || '' });
      await user.save();
    }
    const safe = await User.findById(userId).select('-password');
    return res.status(200).json({ user: safe });
  } catch (err) {
    console.error('addWishlistItem error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const removeWishlistItem = async (req, res) => {
  const { userId } = req;
  const { productId } = req.params || {};
  if (!productId) return res.status(400).json({ error: 'productId required' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlistdata = (user.wishlistdata || []).filter(w => String(w.productId) !== String(productId));
    await user.save();
    const safe = await User.findById(userId).select('-password');
    return res.status(200).json({ user: safe });
  } catch (err) {
    console.error('removeWishlistItem error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};