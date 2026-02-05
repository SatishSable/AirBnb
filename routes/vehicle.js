const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isVehicleOwner } = require("../middleware.js");
const vehicleController = require("../controllers/vehicle.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// All vehicles
router.get("/", wrapAsync(vehicleController.index));

// New vehicle form
router.get("/new", isLoggedIn, vehicleController.renderNewForm);

// Create vehicle
router.post("/", isLoggedIn, upload.single("vehicle[image]"), wrapAsync(vehicleController.createVehicle));

// Show vehicle
router.get("/:id", wrapAsync(vehicleController.showVehicle));

// Edit form
router.get("/:id/edit", isLoggedIn, isVehicleOwner, wrapAsync(vehicleController.renderEditForm));

// Update vehicle
router.put("/:id", isLoggedIn, isVehicleOwner, upload.single("vehicle[image]"), wrapAsync(vehicleController.updateVehicle));

// Delete vehicle
router.delete("/:id", isLoggedIn, isVehicleOwner, wrapAsync(vehicleController.deleteVehicle));

module.exports = router;

