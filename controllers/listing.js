const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { listingSchema } = require("../schema.js");
const mapBoxToken = process.env.Map_Token;
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
  // 🔹 Geocode location with Mapbox
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  }).send();

  // 🔹 Image upload info
  let url = req.file.path;
  let filename = req.file.filename;

  // 🔹 Create new listing
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // 🔹 Always set geometry (fallback if no result)
  if (response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [0, 0], // fallback default
    };
  }

  let saved = await newListing.save();
  console.log("✅ Saved Listing:", saved);

  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", "listing Edited successfully!");

  let original = listing.image.url;
  original = original.replace("/uploads/", "/upload/h_300/");
  res.render("listings/edit.ejs", { listing, original });
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


module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", " listing Deleted successfully!");
  res.redirect("/listings");
}