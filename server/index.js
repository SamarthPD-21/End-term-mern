import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import app from './app.js';
import User from './models/user.model.js';
import Product from './models/product.model.js';

dotenv.config({ path: './.env' });

// App Config
const port = process.env.PORT || 5000;

// Log important env at startup to help diagnose CORS/cookie issues in deployed environments
console.log('SERVER STARTUP: NODE_ENV=', process.env.NODE_ENV, 'CLIENT_URL=', process.env.CLIENT_URL, 'PORT=', process.env.PORT);

// Start server after DB connection to avoid Mongoose buffering timeouts
const startServer = async () => {
    try {
        await connectDB()
        app.listen(port, async () => {
            console.log(`Server listening on port ${port}!`)
            try {
                const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samarthpd21@gmail.com'
                // ensure admin user exists and is flagged isAdmin
                const existing = await User.findOne({ email: ADMIN_EMAIL })
                if (existing) {
                    if (!existing.isAdmin) {
                        existing.isAdmin = true
                        await existing.save()
                        console.log(`Promoted existing user ${ADMIN_EMAIL} to admin`)
                    } else {
                        console.log(`Admin user ${ADMIN_EMAIL} present`)
                    }
                } else {
                    // create a lightweight admin user with a random password — instruct admin to reset via profile update
                    const rand = Math.random().toString(36).slice(2, 10)
                    await User.create({ name: 'Administrator', email: ADMIN_EMAIL, password: rand, isAdmin: true })
                    console.log(`Created admin user ${ADMIN_EMAIL} with temporary password (please reset)`, rand)
                }
            } catch (err) {
                console.error('Error ensuring admin user exists:', err)
            }
                // Start periodic launch processor: move wishlisted scheduled products to carts when their launchAt passes
                try {
                    const processLaunches = async () => {
                        try {
                            const now = new Date();
                            const toLaunch = await Product.find({ launched: false, launchAt: { $lte: now } }).lean();
                            if (!toLaunch || toLaunch.length === 0) return;
                            console.log('Processing launches for', toLaunch.length, 'products');

                            for (const p of toLaunch) {
                                try {
                                    // mark product launched
                                    await Product.updateOne({ _id: p._id }, { $set: { launched: true } });

                                    // find users who have this product in wishlistdata
                                    const users = await User.find({ 'wishlistdata.productId': String(p._id) });
                                    for (const u of users) {
                                        // ensure not already in cart
                                        const inCart = (u.cartdata || []).some(ci => String(ci.productId) === String(p._id));
                                        if (!inCart) {
                                            u.cartdata = u.cartdata || [];
                                            u.cartdata.push({ productId: String(p._id), quantity: 1, name: p.name, price: p.price, image: p.image });
                                        }
                                        // remove from wishlist
                                        u.wishlistdata = (u.wishlistdata || []).filter(w => String(w.productId) !== String(p._id));
                                        await u.save();
                                        console.log(`Moved product ${p._id} to cart for user ${u.email}`);
                                    }
                                } catch (innerErr) {
                                    console.error('Error processing single launch for product', p._id, innerErr);
                                }
                            }
                        } catch (err) {
                            console.error('processLaunches error:', err);
                        }
                    };

                    // Run immediately on startup and then every minute
                    processLaunches();
                    setInterval(processLaunches, 60 * 1000);
                    console.log('Scheduled launch processor started (runs every 60s)');
                } catch (scheduleErr) {
                    console.error('Failed to start launch processor:', scheduleErr);
                }
        })
    } catch (err) {
        console.error('Failed to start server due to DB connection error:', err)
        process.exit(1)
    }
}

startServer()
