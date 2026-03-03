const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function createSuperAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('admin123', salt);
        const existing = await User.findOne({ username: 'admin' });
        if (!existing) {
            const admin = new User({ username: 'admin', password: password, role: 'superadmin' });
            await admin.save();
            console.log("✅ Super admin created: admin / admin123");
        } else {
            console.log("ℹ️ Super admin already exists");
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}
mongoose.connect(MONGO_URI).then(createSuperAdmin);
