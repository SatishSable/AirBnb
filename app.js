const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override"); // fixed spelling
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");
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
app.use("/listings", listings);




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
