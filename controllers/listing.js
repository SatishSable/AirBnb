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
    const guestCount = parseInt(guests);
    if (!isNaN(guestCount)) {
      query.guests = { $gte: guestCount };
    }
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
  req.flash("success", "New listing created successfully!");
  res.redirect(`/listings/${saved._id}`);
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  let original = listing.image && listing.image.url ? listing.image.url : '';
  if (original) {
    original = original.replace("/uploads/", "/upload/h_300/");
  }
  res.render("listings/edit.ejs", { listing, original });
}

module.exports.updateForm = async (req, res) => {
  const { id } = req.params;
  
  // Find the listing first
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Update basic fields
  if (req.body.listing) {
    Object.assign(listing, req.body.listing);
  }

  // Check if location changed to update geocoding
  // We can check if the new location is different from the stored location
  // Note: This relies on req.body.listing.location being present in the update
  if (req.body.listing && req.body.listing.location) {
    const nextLocation = req.body.listing.location.trim();
    // Assuming 'location' is stored as a string on the listing object
    // If not, we might need a different comparison check
    // However, since we just did Object.assign, listing.location is already updated to nextLocation
    // So we need to geocode if the location field was part of the update.
    
    // A better approach is to simply geocode if location is provided, 
    // or checks against a "previous" state if we had it. 
    // But since we already updated 'listing' in memory with Object.assign, 
    // we can just re-geocode the current listing.location.
    // To avoid unnecessary API calls, we could check if it matches the *old* value, 
    // but we didn't keep the old value easily without a second query or careful variable management.
    // Let's just geocode if calling update on location.
    
    let response = await geocodingClient.forwardGeocode({
      query: listing.location,
      limit: 1,
    }).send();

    if (response.body.features.length > 0) {
      listing.geometry = response.body.features[0].geometry;
      listing.mapboxPlaceName = response.body.features[0].place_name;
    }
  }

  // Update images if new files are uploaded
  if (req.files && req.files.length > 0) {
    let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.images = uploadedImages; // This replaces existing images. If you want to append, use concat.
    listing.image = uploadedImages[0]; // backward compat
  }

  await listing.save();

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