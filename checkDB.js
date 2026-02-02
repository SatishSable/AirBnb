const mongoose = require("mongoose");
require("dotenv").config();

const Listing = require("./models/listing.js");
const Vehicle = require("./models/vehicle.js");
const Dhaba = require("./models/dhaba.js");
const User = require("./models/user.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Wanderlust";

async function checkDatabase() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB\n");

        // Count documents in each collection
        const listingsCount = await Listing.countDocuments();
        const vehiclesCount = await Vehicle.countDocuments();
        const dhabasCount = await Dhaba.countDocuments();
        const usersCount = await User.countDocuments();

        console.log("📊 Database Statistics:");
        console.log("========================");
        console.log(`🏠 Listings:  ${listingsCount}`);
        console.log(`🚗 Vehicles:  ${vehiclesCount}`);
        console.log(`🍛 Dhabas:    ${dhabasCount}`);
        console.log(`👤 Users:     ${usersCount}`);
        console.log("========================\n");

        // Show sample data from each collection
        console.log("📋 Sample Vehicles:");
        const vehicles = await Vehicle.find({}).limit(3).select("title location pricePerDay vehicleType");
        vehicles.forEach((v, i) => {
            console.log(`   ${i + 1}. ${v.title} - ${v.location} (₹${v.pricePerDay}/day) [${v.vehicleType}]`);
        });

        console.log("\n📋 Sample Dhabas:");
        const dhabas = await Dhaba.find({}).limit(3).select("title location category rating");
        dhabas.forEach((d, i) => {
            console.log(`   ${i + 1}. ${d.title} - ${d.location} (${d.category}) ⭐${d.rating}`);
        });

        console.log("\n📋 Sample Listings:");
        const listings = await Listing.find({}).limit(3).select("title location price");
        listings.forEach((l, i) => {
            console.log(`   ${i + 1}. ${l.title} - ${l.location} (₹${l.price}/night)`);
        });

        mongoose.connection.close();
        console.log("\n✅ Database check complete!");

    } catch (error) {
        console.error("❌ Error:", error.message);
        mongoose.connection.close();
    }
}

checkDatabase();
