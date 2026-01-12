const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher"], default: "teacher" },
    fullName: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is missing in .env.local');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const adminEmail = "admin@gmail.com";
        const adminPassword = "Admin@1108";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const result = await User.findOneAndUpdate(
            { username: adminEmail },
            {
                $set: {
                    password: hashedPassword,
                    role: 'admin',
                    fullName: 'Administrator'
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Admin user seeded successfully:', result.username);

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

seedAdmin();
