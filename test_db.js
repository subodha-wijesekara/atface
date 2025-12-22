require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('Testing connection to:', uri ? 'URI Provided' : 'No URI found');

if (!uri) {
    console.error('MONGODB_URI is missing in .env.local');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        console.log('Database name:', mongoose.connection.name);
        process.exit(0);
    })
    .catch((err) => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });
