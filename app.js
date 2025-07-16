const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override"); // fixed spelling
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

// Middleware
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Set view engine and views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs' , ejsMate);
app.use(express.static(path.join(__dirname , "/public")))

// Connect to MongoDB
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

// Home route
app.get("/", (req, res) => {
  res.send("Hi, I am route");
});

// Index route - all listings
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings }); // no './'
});

// New route - show form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route - single listing
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

// Create route - post new listing
app.post("/listings", wrapAsync( async(req, res , next) => {
  
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings"); // fixed redirect path
  
  
  
}));

// Edit route - show edit form
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// Update route - put updated listing
app.put("/listings/:id", async (req, res) => {
  console.log("Updating listing:", req.body.listing); // For debug
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
});

// delete route
app.delete("/listings/:id" , async(req ,res) => {
  const { id } = req.params;
 let deleteListing = await Listing.findByIdAndDelete(id);
 console.log(deleteListing);
 res.redirect("/listings");
})

// not found route
app.all("*" ,(req ,res ,next) => {
  next(new ExpressError(404 , "page not found"));
})

// error handling middleware
app.use((err, req, res, next)=>{
  let{ statusCode , message} = err;
 res.status(statusCode).send(message);
})


// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
