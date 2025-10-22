import express from 'express';
import { signup, signin, signout, me, updateMe } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.get('/signin', signin);
authRouter.post('/signout', signout);

// me endpoints
authRouter.get('/me', me);
authRouter.patch('/me', updateMe);

export default authRouter;