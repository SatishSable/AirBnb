const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

app.use(express.json());  // Good practice

// DB connection
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(err => {
    console.error("Connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am route");
});

app.get("/listings" , async (req ,res) => {
     const allListings = await  Listing.find({});
    res.render("./listings/index.ejs" , {allListings});
 
});

// Sample Listing
// app.get("/testListing", async (req, res) => {
//   let sampleListings = new Listing({
//     title: "My new villa",  // fixed spelling
//     description: "By the beach",
//     price: 1200,
//     location: "Pune",
//     country: "India"
//   });

//   await sampleListings.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// });

// Server Start
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
