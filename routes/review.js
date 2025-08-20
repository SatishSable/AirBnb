const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview} = require("../middleware.js")
const mongoose = require("mongoose"); 


router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const listingId = req.params.id.trim();

    
    // This is a simple check to ensure the ID is a valid ObjectId format.
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      throw new ExpressError(400, "Invalid Listing ID format");
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review created successfully!");
    res.redirect(`/listings/${listing._id}`);
  })
);

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
