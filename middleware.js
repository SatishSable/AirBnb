
const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema , listingSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
   
    if(!req.isAuthenticated()) {
      req.session.redirectUrl =  req.originalUrl;
    req.flash("error", "You must be logged in to create a listing");
  return  res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}
module.exports.isOwner = async(req ,res ,next) => {
  const { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "you are not owner of this listing");
      return res.redirect(`/listings/${id}`);  // ✅ added return
    }
    next();
}

 module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

