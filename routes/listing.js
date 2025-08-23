const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const {listingSchema  } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner , validateListing  } = require("../middleware.js");

const listingController = require("../controllers/listing.js"); 

router
.route("/")
.get( wrapAsync(listingController.index))
.post(  isLoggedIn,wrapAsync(listingController.createListing));

// New route - show form
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner,validateListing, wrapAsync(listingController.updateForm))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));







// Edit route - show edit form
router.get("/:id/edit",  isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));





module.exports = router;

