import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import { createProduct } from "../controllers/admin.controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// POST /api/admin/products - create a new product (admin only)
router.post(
  "/products",
  isAuth,
  isAdmin,
  upload.single("image"),
  createProduct
);

export default router;
