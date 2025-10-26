import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import { createProduct, makeAdmin, demoteAdmin, listUsers, listAudits } from "../controllers/admin.controller.js";
import { listContacts, deleteContact } from "../controllers/contact.controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Simple logger to help debug routing / CORS in deployed environments
router.use((req, res, next) => {
  try { console.log('[ADMIN ROUTE]', req.method, req.path, 'Origin:', req.headers.origin); } catch (e) {}
  next();
});

// POST /api/admin/products - create a new product (admin only)
router.post(
  "/products",
  isAuth,
  isAdmin,
  upload.single("image"),
  createProduct
);

// Promote a user (by email) to admin. Only callable by existing admins.
router.post("/make-admin", isAuth, isAdmin, express.json(), makeAdmin);

// Revoke admin rights from a user (by email). Only callable by existing admins.
router.post("/remove-admin", isAuth, isAdmin, express.json(), demoteAdmin);

// list users for admin panel
router.get("/users", isAuth, isAdmin, listUsers);
router.get("/audits", isAuth, isAdmin, listAudits);
// admin: view contact submissions
router.get('/contacts', isAuth, isAdmin, listContacts);
router.delete('/contacts/:id', isAuth, isAdmin, deleteContact);
router.get("/orders", isAuth, isAdmin, (req, res, next) => import('../controllers/admin.controller.js').then(m => m.listOrders(req, res, next)).catch(next));
router.patch('/orders/:orderId/status', isAuth, isAdmin, express.json(), (req, res, next) => import('../controllers/admin.controller.js').then(m => m.updateOrderStatus(req, res, next)).catch(next));

export default router;
