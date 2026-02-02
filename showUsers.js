require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.js');

// Database URLs
const LOCAL_MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
const ATLAS_MONGO_URL = process.env.ATLASDB_URL;

async function showUsersInDB(dbUrl, dbName) {
    try {
        await mongoose.connect(dbUrl);
        console.log(`\n✅ Connected to ${dbName}`);

        const users = await User.find({});

        console.log(`\n📊 Total Users in ${dbName}: ${users.length}`);
        console.log('─'.repeat(60));

        if (users.length > 0) {
            users.forEach((user, index) => {
                console.log(`\n👤 User ${index + 1}:`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Created: ${user._id.getTimestamp().toLocaleString()}`);
            });
        } else {
            console.log('   No users found.');
        }

        console.log('\n' + '─'.repeat(60));
        await mongoose.connection.close();
    } catch (error) {
        console.error(`❌ Error in ${dbName}:`, error.message);
        await mongoose.connection.close();
    }
}

async function main() {
    console.log('================================================');
    console.log('📋 USERS STORED IN DATABASE (PERMANENT)');
    console.log('================================================');

    // Show users in Local MongoDB
    await showUsersInDB(LOCAL_MONGO_URL, 'LOCAL MongoDB');

    // Show users in Atlas MongoDB
    if (ATLAS_MONGO_URL) {
        await showUsersInDB(ATLAS_MONGO_URL, 'MongoDB ATLAS');
    }

    console.log('\n================================================');
    console.log('✅ All users above are PERMANENTLY stored!');
    console.log('   They will NOT be deleted when server restarts.');
    console.log('================================================\n');
}

main();
