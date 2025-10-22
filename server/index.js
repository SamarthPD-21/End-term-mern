import dotenv from 'dotenv';
import express from 'express';
import cors from "cors";
import connectDB from './config/mongodb.js';
import cartRoutes from './routes/cart.route.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config({ path: './.env' });

// App Config
const app = express();
const port = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(cookieParser());

// API Endpoints
app.get('/', (req, res) => res.send('Hello World!'));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRoutes);

// Error handler (must be after routes)
app.use((err, req, res, next) => {
    console.error('Unhandled error middleware:', err);
    if (err && err.name === 'MulterError') {
        return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err?.message || 'Internal server error' });
});

// Listener
app.listen(port, () => console.log(`Server listening on port ${port}!`));
