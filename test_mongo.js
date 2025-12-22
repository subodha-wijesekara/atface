require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log("Testing MongoDB Connection...");

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("No MONGODB_URI found");
    process.exit(1);
}

// Mask password for safety in logs
const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`Connecting to: ${maskedUri}`);

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        console.log("State:", mongoose.connection.readyState);
        return mongoose.disconnect();
    })
    .catch(err => {
        console.error("CONNECTION FAILED:");
        console.error(err);
        process.exit(1);
    });
