const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    console.log('Attempting to connect to:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

test();
