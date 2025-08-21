const Listing = require("../models/listing");
const Review = require("../models/review");
const mongoose = require("mongoose");


module.exports.createReview = async (req, res) => {
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
      newReview.author = req.user._id;
    listing.reviews.push(newReview);
  console.log(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review created successfully!");
    res.redirect(`/listings/${listing._id}`);
  }

  module.exports.deleteReview = async (req, res) => {
      const { id, reviewId } = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash("success", "Review deleted successfully!");
      res.redirect(`/listings/${id}`);
    }