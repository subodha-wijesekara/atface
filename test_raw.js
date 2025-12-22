require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
console.log('Testing raw MongoDB driver connection...');

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to server (Raw Driver)");
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Raw Driver Error:", err);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
