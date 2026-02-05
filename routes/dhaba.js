const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isDhabaOwner } = require("../middleware.js");
const dhabaController = require("../controllers/dhaba.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// All dhabas
router.get("/", wrapAsync(dhabaController.index));

// New dhaba form
router.get("/new", isLoggedIn, dhabaController.renderNewForm);

// Create dhaba
router.post("/", isLoggedIn, upload.single("dhaba[image]"), wrapAsync(dhabaController.createDhaba));

// Show dhaba
router.get("/:id", wrapAsync(dhabaController.showDhaba));

// Edit form
router.get("/:id/edit", isLoggedIn, isDhabaOwner, wrapAsync(dhabaController.renderEditForm));

// Update dhaba
router.put("/:id", isLoggedIn, isDhabaOwner, upload.single("dhaba[image]"), wrapAsync(dhabaController.updateDhaba));

// Delete dhaba
router.delete("/:id", isLoggedIn, isDhabaOwner, wrapAsync(dhabaController.deleteDhaba));

module.exports = router;
