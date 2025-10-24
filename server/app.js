import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import cartRoutes from './routes/cart.route.js';
import adminRouter from './routes/admin.routes.js';
import debugRouter from './routes/debug.routes.js';
import productRouter from './routes/product.routes.js';

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.send('Hello World!'));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/products', productRouter);
app.use('/api/debug', debugRouter);

// Error handler (must be after routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error middleware:', err);
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: err?.message || 'Internal server error' });
});

export default app;
