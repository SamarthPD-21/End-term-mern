import dotenv from 'dotenv';
import express from 'express';
import cors from "cors";
import connectDB from './config/mongodb.js';
import User from './models/user.model.js';
import cartRoutes from './routes/cart.route.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/admin.routes.js';
import productRouter from './routes/product.routes.js';

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
app.use('/api/admin', adminRouter);
app.use('/api/products', productRouter);

// Error handler (must be after routes)
app.use((err, req, res, next) => {
    console.error('Unhandled error middleware:', err);
    if (err && err.name === 'MulterError') {
        return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err?.message || 'Internal server error' });
});

// Listener
app.listen(port, async () => {
    console.log(`Server listening on port ${port}!`);
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samarthpd21@gmail.com';
        // ensure admin user exists and is flagged isAdmin
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            if (!existing.isAdmin) {
                existing.isAdmin = true;
                await existing.save();
                console.log(`Promoted existing user ${ADMIN_EMAIL} to admin`);
            } else {
                console.log(`Admin user ${ADMIN_EMAIL} present`);
            }
        } else {
            // create a lightweight admin user with a random password — instruct admin to reset via profile update
            const rand = Math.random().toString(36).slice(2, 10);
            const newUser = await User.create({ name: 'Administrator', email: ADMIN_EMAIL, password: rand, isAdmin: true });
            console.log(`Created admin user ${ADMIN_EMAIL} with temporary password (please reset)`, rand);
        }
    } catch (err) {
        console.error('Error ensuring admin user exists:', err);
    }
});
