const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const {listingSchema  } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner , validateListing  } = require("../middleware.js");

const listingController = require("../controllers/listing.js"); 




// Index route - all listings
router.get("/", wrapAsync(listingController.index));

// New route - show form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show route - single listing
router.get("/:id", wrapAsync(listingController.showListing));


// Create route - post new listing
router.post("/",  isLoggedIn,wrapAsync(listingController.createListing));

// Edit route - show edit form
router.get("/:id/edit",  isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update route - put updated listing
router.put("/:id", isLoggedIn, isOwner,validateListing, wrapAsync(listingController.updateForm));


// delete route
router.delete("/:id" ,isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;

