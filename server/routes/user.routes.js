import express from "express";
import { getCurrentUser, editCurrentUser, addUserAddress, deleteUserAddress } from "../controllers/user.controller.js";
import isAuth from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.patch("/update-profile", isAuth, editCurrentUser);
userRouter.post("/add-address", isAuth, addUserAddress);
userRouter.delete("/delete-address/:addressId", isAuth, deleteUserAddress);

export default userRouter;