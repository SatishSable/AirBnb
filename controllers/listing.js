const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");


module.exports.index  = async (req, res) => {
  const allListings = await Listing.find({});
 
  res.render("listings/index.ejs", { allListings }); // no './'
}

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new.ejs");
  
}

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: {
      path : "author",
    }
  })
  .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");  // ✅ added return
  } 
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}



module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url  , " " , filename);
  
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // set owner
  newListing.image = {url , filename};
  await newListing.save();

  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", "listing Edited successfully!");

  let original = listing.image.url;
  original =  original.replace("/uploads/", "/upload/h_300/");
  res.render("listings/edit.ejs", { listing , original });
}

module.exports.updateForm = async (req, res) => {
  const { id } = req.params;

  // Update text fields (title, price, etc.)
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // ✅ Update image ONLY if a new file is uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  
  }

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async(req ,res) => {
  const { id } = req.params;
 let deleteListing = await Listing.findByIdAndDelete(id);
 console.log(deleteListing);
 req.flash("success", " listing Deleted successfully!");
 res.redirect("/listings");
}