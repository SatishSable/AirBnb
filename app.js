const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override"); // fixed spelling
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
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

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

// Index route - all listings
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  console.log("Showing all listings", allListings)
  res.render("listings/index.ejs", { allListings }); // no './'
}));

// New route - show form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route - single listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

// Create route - post new listing
app.post("/listings", wrapAsync( async(req, res , next) => {
  let result = listingSchema.validate(req.body);
  console.log(result);
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings"); // fixed redirect path
  
  
  
}));

// Edit route - show edit form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// Update route - put updated listing
app.put("/listings/:id", wrapAsync(async (req, res) => {
  console.log("Updating listing:", req.body.listing); // For debug
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
}));

// delete route
app.delete("/listings/:id" , wrapAsync(async(req ,res) => {
  const { id } = req.params;
 let deleteListing = await Listing.findByIdAndDelete(id);
 console.log(deleteListing);
 res.redirect("/listings");
}));

// post Reviews route - show reviews for a listing
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let id = req.params.id.trim(); // Trim spaces
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review); // should be lowercase 'review'

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save(); // Save the updated listing
  res.redirect(`/listings/${listing._id}`);
}));

// delete  review route

app.delete("/listings/:listingId/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { listingId, reviewId } = req.params;
  await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${listingId}`);
}));



// error handling middleware
app.use((err, req, res, next)=>{
  let{ statusCode = 500  , message = "something went wrong!" } = err;
//  res.status(statusCode).send(message);
    res.render("error.ejs" , {err});
})


// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
