import express from "express";
import { getCurrentUser, editCurrentUser, addUserAddress, deleteUserAddress, uploadProfileImage } from "../controllers/user.controller.js";
import isAuth from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.patch("/update-profile", isAuth, editCurrentUser);
userRouter.post("/add-address", isAuth, addUserAddress);
userRouter.delete("/delete-address/:addressId", isAuth, deleteUserAddress);
userRouter.post("/upload-profile-image", isAuth, upload.single("image"), uploadProfileImage);
userRouter.post("/wishlist", isAuth, (req, res, next) => import('../controllers/user.controller.js').then(m => m.addWishlistItem(req, res, next)).catch(next));
userRouter.delete("/wishlist/:productId", isAuth, (req, res, next) => import('../controllers/user.controller.js').then(m => m.removeWishlistItem(req, res, next)).catch(next));
// Create order from cart (authenticated users)
userRouter.post("/order/create", isAuth, express.json(), (req, res, next) => import('../controllers/user.controller.js').then(m => m.createOrder(req, res, next)).catch(next));

export default userRouter;