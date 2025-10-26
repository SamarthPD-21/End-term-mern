import express from "express";
import { listProducts, getProductById, updateProduct, deleteProduct, getProductsBatch, listProductComments, addProductComment, editProductComment, deleteProductComment, adjustProductQuantity, addProductCommentReply, deleteCommentReply } from "../controllers/product.controller.js";
import isAuth from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// GET /api/products?category=Leather
router.get("/", listProducts);

// public: get single product
router.get("/:id", getProductById);

// comments for a product
router.get('/:id/comments', listProductComments);
router.post('/:id/comments', isAuth, addProductComment);
// edit/delete a specific comment (owner or admin)
router.put('/:id/comments/:commentId', isAuth, editProductComment);
router.delete('/:id/comments/:commentId', isAuth, deleteProductComment);
// anyone authenticated can reply; admin replies will be marked server-side
router.post('/:id/comments/:commentId/reply', isAuth, addProductCommentReply);
// delete a reply (owner or admin)
router.delete('/:id/comments/:commentId/replies/:replyId', isAuth, deleteCommentReply);

// batch: POST /api/products/batch { ids: [...] }
router.post('/batch', getProductsBatch);

// admin-only: update and delete
router.put("/:id", isAuth, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", isAuth, isAdmin, deleteProduct);

// atomic adjust (admin-only): { delta: number }
router.post('/:id/adjust', isAuth, isAdmin, adjustProductQuantity);

export default router;
