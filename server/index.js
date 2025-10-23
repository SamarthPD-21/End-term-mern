import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import app from './app.js';
import User from './models/user.model.js';

dotenv.config({ path: './.env' });

// App Config
const port = process.env.PORT || 5000;

// Connect DB
connectDB();

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
