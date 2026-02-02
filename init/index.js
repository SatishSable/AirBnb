const mongoose = require("mongoose");
require("dotenv").config();

const Listing = require("../models/listing.js");
const Vehicle = require("../models/vehicle.js");
const Dhaba = require("../models/dhaba.js");

const listingData = require("./data.js");

// Database URLs
const LOCAL_MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
const ATLAS_MONGO_URL = process.env.ATLASDB_URL;

// Sample Vehicles Data
const vehicleData = [
  {
    title: "Royal Enfield Classic 350",
    description: "The iconic Royal Enfield Classic 350 - perfect for highway cruising and mountain rides. Well maintained with recent service.",
    image: {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      filename: "royal_enfield"
    },
    pricePerDay: 1200,
    location: "Mumbai, Maharashtra",
    vehicleType: "bike",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2022,
    fuelType: "Petrol",
    transmission: "Manual",
    seats: 2,
    features: ["Helmet Included", "Tool Kit", "Insurance Included"],
    available: true,
    instantBook: true,
    rating: 4.8,
    reviewCount: 45,
    geometry: { type: "Point", coordinates: [72.8777, 19.0760] }
  },
  {
    title: "Maruti Swift ZXI",
    description: "Compact and fuel-efficient hatchback, perfect for city drives and short trips. AC, music system, and great mileage.",
    image: {
      url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      filename: "maruti_swift"
    },
    pricePerDay: 2500,
    location: "Delhi NCR",
    vehicleType: "car",
    brand: "Maruti Suzuki",
    model: "Swift ZXI",
    year: 2023,
    fuelType: "Petrol",
    transmission: "Manual",
    seats: 5,
    features: ["AC", "Music System", "GPS", "USB Charger", "Insurance Included"],
    available: true,
    instantBook: false,
    rating: 4.6,
    reviewCount: 32,
    geometry: { type: "Point", coordinates: [77.2090, 28.6139] }
  },
  {
    title: "Honda Activa 6G",
    description: "Easy to ride automatic scooter, ideal for city commuting and exploring local areas. Great for beginners.",
    image: {
      url: "https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800",
      filename: "honda_activa"
    },
    pricePerDay: 600,
    location: "Bangalore, Karnataka",
    vehicleType: "scooter",
    brand: "Honda",
    model: "Activa 6G",
    year: 2023,
    fuelType: "Petrol",
    transmission: "Automatic",
    seats: 2,
    features: ["Helmet Included", "USB Charger", "Insurance Included"],
    available: true,
    instantBook: true,
    rating: 4.5,
    reviewCount: 67,
    geometry: { type: "Point", coordinates: [77.5946, 12.9716] }
  },
  {
    title: "Mahindra Thar 4x4",
    description: "The adventure-ready Mahindra Thar - conquer any terrain. Perfect for Ladakh trips and off-road adventures.",
    image: {
      url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
      filename: "mahindra_thar"
    },
    pricePerDay: 5000,
    location: "Manali, Himachal Pradesh",
    vehicleType: "suv",
    brand: "Mahindra",
    model: "Thar 4x4",
    year: 2023,
    fuelType: "Diesel",
    transmission: "Manual",
    seats: 4,
    features: ["AC", "Music System", "GPS", "First Aid Kit", "Tool Kit", "Insurance Included"],
    available: true,
    instantBook: false,
    rating: 4.9,
    reviewCount: 28,
    geometry: { type: "Point", coordinates: [77.1892, 32.2396] }
  },
  {
    title: "KTM Duke 390",
    description: "High-performance sports bike for thrill seekers. Perfect for mountain twisties and adrenaline-packed rides.",
    image: {
      url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
      filename: "ktm_duke"
    },
    pricePerDay: 2000,
    location: "Pune, Maharashtra",
    vehicleType: "bike",
    brand: "KTM",
    model: "Duke 390",
    year: 2022,
    fuelType: "Petrol",
    transmission: "Manual",
    seats: 2,
    features: ["Helmet Included", "Tool Kit", "Insurance Included"],
    available: true,
    instantBook: true,
    rating: 4.7,
    reviewCount: 19,
    geometry: { type: "Point", coordinates: [73.8567, 18.5204] }
  },
  {
    title: "Toyota Innova Crysta",
    description: "Spacious 7-seater MPV perfect for family trips and group travel. Comfortable, reliable, and feature-rich.",
    image: {
      url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      filename: "innova"
    },
    pricePerDay: 4500,
    location: "Chennai, Tamil Nadu",
    vehicleType: "van",
    brand: "Toyota",
    model: "Innova Crysta",
    year: 2022,
    fuelType: "Diesel",
    transmission: "Automatic",
    seats: 7,
    features: ["AC", "Music System", "GPS", "USB Charger", "First Aid Kit", "Insurance Included"],
    available: true,
    instantBook: false,
    rating: 4.8,
    reviewCount: 41,
    geometry: { type: "Point", coordinates: [80.2707, 13.0827] }
  }
];

// Sample Dhabas Data
const dhabaData = [
  {
    title: "Baba Ka Dhaba",
    description: "Authentic Punjabi dhaba serving delicious parathas, dal makhani, and butter chicken since 1985. A true highway legend!",
    image: {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      filename: "baba_dhaba"
    },
    location: "GT Road, Murthal, Haryana",
    cuisine: ["North Indian", "Punjabi"],
    category: "Dhaba",
    priceRange: "₹₹",
    specialties: ["Butter Chicken", "Dal Makhani", "Aloo Paratha", "Lassi"],
    timings: { open: "6:00 AM", close: "12:00 AM" },
    features: ["Parking", "Outdoor Seating", "Family Friendly", "Non-Veg Available"],
    contact: "+91 98765 43210",
    rating: 4.7,
    reviewCount: 234,
    verified: true,
    geometry: { type: "Point", coordinates: [77.0266, 28.8925] }
  },
  {
    title: "South Indian Express",
    description: "Authentic South Indian cuisine with the crispiest dosas and fluffiest idlis. Filter coffee that will wake your soul!",
    image: {
      url: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
      filename: "south_indian"
    },
    location: "Koramangala, Bangalore",
    cuisine: ["South Indian"],
    category: "Restaurant",
    priceRange: "₹",
    specialties: ["Masala Dosa", "Filter Coffee", "Idli Sambar", "Vada"],
    timings: { open: "7:00 AM", close: "10:00 PM" },
    features: ["AC Dining", "Pure Veg", "Family Friendly", "Takeaway"],
    contact: "+91 80 4567 8901",
    rating: 4.5,
    reviewCount: 189,
    verified: true,
    geometry: { type: "Point", coordinates: [77.6101, 12.9352] }
  },
  {
    title: "Sharma Ji Ki Chai",
    description: "The best cutting chai on the highway! Hot samosas, pakoras, and the warmth of a roadside tea stall.",
    image: {
      url: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800",
      filename: "chai_stall"
    },
    location: "Mumbai-Pune Expressway",
    cuisine: ["Street Food"],
    category: "Tea Stall",
    priceRange: "₹",
    specialties: ["Cutting Chai", "Bun Maska", "Samosa", "Vada Pav"],
    timings: { open: "5:00 AM", close: "11:00 PM" },
    features: ["Parking", "Outdoor Seating", "Pure Veg", "Takeaway"],
    contact: "+91 98211 12345",
    rating: 4.3,
    reviewCount: 456,
    verified: false,
    geometry: { type: "Point", coordinates: [73.3812, 18.7557] }
  },
  {
    title: "Rajasthani Rasoi",
    description: "Experience the royal flavors of Rajasthan. Dal Baati Churma, Gatte ki Sabzi, and authentic Rajasthani thali.",
    image: {
      url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
      filename: "rajasthani"
    },
    location: "Jaipur, Rajasthan",
    cuisine: ["Rajasthani", "North Indian"],
    category: "Restaurant",
    priceRange: "₹₹",
    specialties: ["Dal Baati Churma", "Gatte ki Sabzi", "Ker Sangri", "Ghevar"],
    timings: { open: "11:00 AM", close: "11:00 PM" },
    features: ["AC Dining", "Pure Veg", "Family Friendly", "Parking"],
    contact: "+91 141 456 7890",
    rating: 4.6,
    reviewCount: 312,
    verified: true,
    geometry: { type: "Point", coordinates: [75.7873, 26.9124] }
  },
  {
    title: "Highway Haveli",
    description: "Premium dhaba experience on NH-44. Live kitchen, cultural ambiance, and the best Punjabi food on Indian highways.",
    image: {
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      filename: "highway_haveli"
    },
    location: "NH-44, Near Panipat",
    cuisine: ["North Indian", "Punjabi", "Multi-Cuisine"],
    category: "Dhaba",
    priceRange: "₹₹₹",
    specialties: ["Tandoori Chicken", "Paneer Tikka", "Makki di Roti", "Sarson da Saag"],
    timings: { open: "24 Hours", close: "24 Hours" },
    features: ["Parking", "Outdoor Seating", "Family Friendly", "Non-Veg Available", "AC Dining"],
    contact: "+91 98765 00000",
    rating: 4.8,
    reviewCount: 567,
    verified: true,
    geometry: { type: "Point", coordinates: [76.9635, 29.3909] }
  },
  {
    title: "Gujju Bhai Farsan",
    description: "Authentic Gujarati snacks and sweets. Famous for Dhokla, Khandvi, Fafda-Jalebi, and handmade sweets.",
    image: {
      url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
      filename: "gujarati"
    },
    location: "Ahmedabad, Gujarat",
    cuisine: ["Gujarati", "Street Food"],
    category: "Sweet Shop",
    priceRange: "₹",
    specialties: ["Dhokla", "Khandvi", "Fafda-Jalebi", "Thepla"],
    timings: { open: "8:00 AM", close: "9:00 PM" },
    features: ["Pure Veg", "Takeaway", "Home Delivery", "Family Friendly"],
    contact: "+91 79 2345 6789",
    rating: 4.4,
    reviewCount: 289,
    verified: true,
    geometry: { type: "Point", coordinates: [72.5714, 23.0225] }
  }
];

// Initialize data for a single database
const initSingleDB = async (dbName, mongoUrl) => {
  try {
    console.log(`\n📦 Initializing ${dbName}...`);
    await mongoose.connect(mongoUrl);
    console.log(`✅ Connected to ${dbName}`);

    // Find a real user ID from database
    const User = require("../models/user.js");
    let owner = await User.findOne({});

    if (!owner) {
      // Create a default user if none exists
      owner = new User({
        username: 'admin',
        email: 'admin@wanderlust.com'
      });
      await User.register(owner, 'admin1234');
      console.log("🔐 Created default admin user");
    }

    const ownerId = owner._id;
    console.log("👤 Using owner ID:", ownerId);

    // Clear existing data
    await Listing.deleteMany({});
    await Vehicle.deleteMany({});
    await Dhaba.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert listings with owner
    const listingsWithOwner = listingData.data.map((obj) => ({ ...obj, owner: ownerId }));
    await Listing.insertMany(listingsWithOwner);
    console.log("🏠 Listings initialized:", listingsWithOwner.length);

    // Insert vehicles with owner
    const vehiclesWithOwner = vehicleData.map((obj) => ({ ...obj, owner: ownerId }));
    await Vehicle.insertMany(vehiclesWithOwner);
    console.log("🚗 Vehicles initialized:", vehiclesWithOwner.length);

    // Insert dhabas with owner
    const dhabasWithOwner = dhabaData.map((obj) => ({ ...obj, owner: ownerId }));
    await Dhaba.insertMany(dhabasWithOwner);
    console.log("🍛 Dhabas initialized:", dhabasWithOwner.length);

    console.log(`✅ ${dbName} initialized successfully!`);
    await mongoose.connection.close();

  } catch (error) {
    console.error(`❌ Error initializing ${dbName}:`, error.message);
    await mongoose.connection.close();
  }
};

// Main function to initialize BOTH databases
const initAllDBs = async () => {
  console.log("🚀 Starting database initialization for LOCAL and ATLAS...\n");
  console.log("=".repeat(50));

  // 1. Initialize LOCAL MongoDB
  await initSingleDB("LOCAL MongoDB", LOCAL_MONGO_URL);

  console.log("\n" + "=".repeat(50));

  // 2. Initialize ATLAS MongoDB
  if (ATLAS_MONGO_URL) {
    await initSingleDB("MongoDB ATLAS", ATLAS_MONGO_URL);
  } else {
    console.log("⚠️  ATLAS_MONGO_URL not found in .env, skipping Atlas...");
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 All databases initialized successfully!");
};

initAllDBs();
