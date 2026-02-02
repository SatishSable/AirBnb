require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.js');

// Database URLs
const LOCAL_MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
const ATLAS_MONGO_URL = process.env.ATLASDB_URL;

// User credentials to create
const USERNAME = 'wanderer';
const PASSWORD = 'wanderlust123';
const EMAIL = 'wanderer@wanderlust.com';

async function createUserInDB(dbUrl, dbName) {
    try {
        await mongoose.connect(dbUrl);
        console.log(`\n✅ Connected to ${dbName}`);

        // Check if user exists
        const existingUser = await User.findOne({ username: USERNAME });

        if (existingUser) {
            console.log(`📌 User "${USERNAME}" already exists in ${dbName}`);
        } else {
            // Create new user
            const newUser = new User({
                username: USERNAME,
                email: EMAIL
            });
            await User.register(newUser, PASSWORD);
            console.log(`✅ User "${USERNAME}" created in ${dbName}`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error(`❌ Error in ${dbName}:`, error.message);
        await mongoose.connection.close();
    }
}

async function main() {
    console.log('================================================');
    console.log('🔐 CREATING USER IN BOTH DATABASES');
    console.log('================================================');

    // Create in Local MongoDB
    await createUserInDB(LOCAL_MONGO_URL, 'LOCAL MongoDB');

    // Create in Atlas MongoDB
    if (ATLAS_MONGO_URL) {
        await createUserInDB(ATLAS_MONGO_URL, 'MongoDB ATLAS');
    } else {
        console.log('\n⚠️  ATLAS_MONGO_URL not found, skipping Atlas...');
    }

    console.log('\n================================================');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('================================================');
    console.log(`   👤 Username: ${USERNAME}`);
    console.log(`   🔒 Password: ${PASSWORD}`);
    console.log(`   📧 Email: ${EMAIL}`);
    console.log('================================================');
    console.log('\n🌐 Login at: http://localhost:8080/login');
    console.log('\n✅ You can now login with these credentials!\n');
}

main();
