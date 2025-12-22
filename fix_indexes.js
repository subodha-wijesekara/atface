const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixIndexes() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI is missing");

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('students');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        // Drop nic_1 if exists
        if (indexes.find(i => i.name === 'nic_1')) {
            await collection.dropIndex('nic_1');
            console.log('Dropped index: nic_1');
        }

        // Drop phone_1 if exists
        if (indexes.find(i => i.name === 'phone_1')) {
            await collection.dropIndex('phone_1');
            console.log('Dropped index: phone_1');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit();
    }
}

fixIndexes();
