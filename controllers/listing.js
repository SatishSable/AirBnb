const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { listingSchema } = require("../schema.js");
const mapBoxToken = process.env.Map_Token || "";
// We use a fallback empty string to prevent the SDK from throwing and crashing the process on load
// if the token is missing. Geocoding will still fail later if the token is invalid.
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index.ejs", { allListings }); // no './'
}

module.exports.searchListings = async (req, res) => {
  const { location, checkIn, checkOut, guests, category } = req.query;

  let query = {};

  // Search by location (case-insensitive, partial match)
  if (location) {
    query.$or = [
      { location: { $regex: location, $options: 'i' } },
      { country: { $regex: location, $options: 'i' } },
      { title: { $regex: location, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category && category !== 'all') {
    query.category = category;
  }

  // Filter by guest capacity
  if (guests) {
    query.guests = { $gte: parseInt(guests) };
  }

  const allListings = await Listing.find(query);

  res.render("listings/index.ejs", { allListings });
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
        path: "author",
      }
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");  // ✅ added return
  }
  console.log("Map Token:", process.env.Map_Token ? "Present" : "Missing");
  res.render("listings/show.ejs", { listing, mapBoxToken: process.env.Map_Token });
}




module.exports.createListing = async (req, res, next) => {
  // Geocode location with Mapbox
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  }).send();

  // Handle multiple image uploads
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
  }

  // Create new listing
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.images = uploadedImages;
  // Backward compatibility: set single image to first uploaded photo
  if (uploadedImages.length > 0) {
    newListing.image = uploadedImages[0];
  }

  // Always set geometry (fallback if no result)
  if (response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
    newListing.mapboxPlaceName = response.body.features[0].place_name;
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [0, 0], // fallback default
    };
    newListing.mapboxPlaceName = undefined;
  }

  let saved = await newListing.save();
  console.log(" Saved Listing:", saved);

  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  req.flash("success", "listing Edited successfully!");

  let original = listing.image && listing.image.url ? listing.image.url : '';
  if (original) {
    original = original.replace("/uploads/", "/upload/h_300/");
  }
  res.render("listings/edit.ejs", { listing, original });
}

module.exports.updateForm = async (req, res) => {
  const { id } = req.params;

  const existingListing = await Listing.findById(id);
  const prevLocation = (existingListing?.location || "").trim();

  // Update text fields (title, price, etc.)
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.body.listing && typeof req.body.listing.location === "string") {
    const nextLocation = req.body.listing.location.trim();

    if (nextLocation && nextLocation !== prevLocation) {
      let response = await geocodingClient.forwardGeocode({
        query: nextLocation,
        limit: 1,
      }).send();

      if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
        listing.mapboxPlaceName = response.body.features[0].place_name;
      }
      await listing.save();
    }
  }

  // Update images if new files are uploaded
  if (req.files && req.files.length > 0) {
    let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.images = uploadedImages;
    listing.image = uploadedImages[0]; // backward compat
    await listing.save();
  }

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", " listing Deleted successfully!");
  res.redirect("/listings");
}