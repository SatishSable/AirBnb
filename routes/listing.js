const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}



// Index route - all listings
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  console.log("Showing all listings", allListings)
  res.render("listings/index.ejs", { allListings }); // no './'
}));

// New route - show form
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route - single listing
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    req.flash( "error", "Listing not found");
    res.redirect("/listings");
  } 
  res.render("listings/show.ejs", { listing });
}));

// Create route - post new listing
router.post("/", wrapAsync( async(req, res , next) => {
  let result = listingSchema.validate(req.body);
  console.log(result);
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New listing created successfully!");
  res.redirect("/listings"); // fixed redirect path
  
  
  
}));

// Edit route - show edit form
router.get("/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", "listing Edited successfully!");
  res.render("listings/edit.ejs", { listing });
}));

// Update route - put updated listing
router.put("/:id", wrapAsync(async (req, res) => {
  
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", " listing Update successfully!");
  res.redirect("/listings");
}));

// delete route
router.delete("/:id" , wrapAsync(async(req ,res) => {
  const { id } = req.params;
 let deleteListing = await Listing.findByIdAndDelete(id);
 console.log(deleteListing);
 req.flash("success", " listing Deleted successfully!");
 res.redirect("/listings");
}));

module.exports = router;

