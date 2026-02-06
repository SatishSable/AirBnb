const Vehicle = require("../models/vehicle.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.Map_Token;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const { type, location } = req.query;
    let query = {};

    if (type && type !== 'all') {
        query.vehicleType = type;
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    const vehicles = await Vehicle.find(query).populate("owner");
    res.render("vehicles/index.ejs", { vehicles, query: type || '' });
};

module.exports.showVehicle = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).populate("owner");

    if (!vehicle) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/vehicles");
    }

    res.render("vehicles/show.ejs", { vehicle, mapBoxToken: process.env.Map_Token });
};

module.exports.renderNewForm = (req, res) => {
    res.render("vehicles/new.ejs");
};

module.exports.createVehicle = async (req, res) => {
    const newVehicle = new Vehicle(req.body.vehicle);
    newVehicle.owner = req.user._id;

    if (req.file) {
        newVehicle.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Geocode location with Mapbox (fallback if no result)
    let response = await geocodingClient.forwardGeocode({
        query: newVehicle.location,
        limit: 1,
    }).send();

    if (response.body.features.length > 0) {
        newVehicle.geometry = response.body.features[0].geometry;
        newVehicle.mapboxPlaceName = response.body.features[0].place_name;
    } else {
        newVehicle.geometry = {
            type: "Point",
            coordinates: [77.5946, 12.9716] // Default Bangalore
        };
        newVehicle.mapboxPlaceName = undefined;
    }

    await newVehicle.save();
    req.flash("success", "Vehicle listed successfully!");
    res.redirect("/vehicles");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/vehicles");
    }

    res.render("vehicles/edit.ejs", { vehicle });
};

module.exports.updateVehicle = async (req, res) => {
    const { id } = req.params;

    const existingVehicle = await Vehicle.findById(id);
    const prevLocation = (existingVehicle?.location || "").trim();

    const vehicle = await Vehicle.findByIdAndUpdate(id, { ...req.body.vehicle }, { new: true });

    if (req.body.vehicle && typeof req.body.vehicle.location === "string") {
        const nextLocation = req.body.vehicle.location.trim();
        if (nextLocation && nextLocation !== prevLocation) {
            let response = await geocodingClient.forwardGeocode({
                query: nextLocation,
                limit: 1,
            }).send();

            if (response.body.features.length > 0) {
                vehicle.geometry = response.body.features[0].geometry;
                vehicle.mapboxPlaceName = response.body.features[0].place_name;
                await vehicle.save();
            }
        }
    }

    if (req.file) {
        vehicle.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await vehicle.save();
    }

    req.flash("success", "Vehicle updated successfully!");
    res.redirect(`/vehicles/${id}`);
};

module.exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    await Vehicle.findByIdAndDelete(id);
    req.flash("success", "Vehicle deleted successfully!");
    res.redirect("/vehicles");
};
