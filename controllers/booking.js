const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const Vehicle = require("../models/vehicle.js");
const Dhaba = require("../models/dhaba.js");

// ================================
// LISTING BOOKING
// ================================

// Create Listing Booking
module.exports.createListingBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, guests } = req.body;

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Calculate nights and prices
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            req.flash("error", "Invalid dates selected");
            return res.redirect(`/listings/${id}`);
        }

        const basePrice = listing.price * nights;
        const serviceFee = Math.round(basePrice * 0.10);
        const taxes = Math.round(basePrice * 0.18);
        const totalPrice = basePrice + serviceFee + taxes;

        // Store booking data in session for payment page
        req.session.pendingBooking = {
            type: 'listing',
            itemId: id,
            checkIn,
            checkOut,
            guests: parseInt(guests),
            nights,
            basePrice,
            serviceFee,
            taxes,
            totalPrice,
            title: listing.title,
            location: `${listing.location}, ${listing.country}`,
            image: listing.image?.url,
            pricePerUnit: listing.price,
            unitLabel: 'night'
        };

        res.redirect("/bookings/payment");

    } catch (error) {
        console.error("Create listing booking error:", error);
        req.flash("error", "Failed to create booking");
        res.redirect("/listings");
    }
};

// ================================
// VEHICLE BOOKING
// ================================

// Create Vehicle Booking
module.exports.createVehicleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut } = req.body;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            req.flash("error", "Vehicle not found");
            return res.redirect("/vehicles");
        }

        // Calculate days
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            req.flash("error", "Invalid dates selected");
            return res.redirect(`/vehicles/${id}`);
        }

        const basePrice = vehicle.pricePerDay * days;
        const serviceFee = Math.round(basePrice * 0.08);
        const taxes = Math.round(basePrice * 0.18);
        const totalPrice = basePrice + serviceFee + taxes;

        req.session.pendingBooking = {
            type: 'vehicle',
            itemId: id,
            checkIn,
            checkOut,
            guests: 1,
            nights: days,
            basePrice,
            serviceFee,
            taxes,
            totalPrice,
            title: vehicle.title,
            location: vehicle.location,
            image: vehicle.image?.url,
            pricePerUnit: vehicle.pricePerDay,
            unitLabel: 'day'
        };

        res.redirect("/bookings/payment");

    } catch (error) {
        console.error("Create vehicle booking error:", error);
        req.flash("error", "Failed to create booking");
        res.redirect("/vehicles");
    }
};

// ================================
// DHABA BOOKING
// ================================

// Create Dhaba Reservation
module.exports.createDhabaBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, guests } = req.body;

        const dhaba = await Dhaba.findById(id);
        if (!dhaba) {
            req.flash("error", "Dhaba not found");
            return res.redirect("/dhabas");
        }

        // For dhabas, we'll charge a small reservation fee
        const reservationFee = 100;
        const taxes = Math.round(reservationFee * 0.18);
        const totalPrice = reservationFee + taxes;

        req.session.pendingBooking = {
            type: 'dhaba',
            itemId: id,
            checkIn: date,
            checkOut: date,
            reservationTime: time,
            guests: parseInt(guests),
            nights: 1,
            basePrice: reservationFee,
            serviceFee: 0,
            taxes,
            totalPrice,
            title: dhaba.title,
            location: dhaba.location,
            image: dhaba.image?.url,
            pricePerUnit: reservationFee,
            unitLabel: 'reservation'
        };

        res.redirect("/bookings/payment");

    } catch (error) {
        console.error("Create dhaba booking error:", error);
        req.flash("error", "Failed to create reservation");
        res.redirect("/dhabas");
    }
};

// ================================
// PAYMENT PAGE
// ================================

module.exports.showPaymentPage = async (req, res) => {
    const booking = req.session.pendingBooking;

    if (!booking) {
        req.flash("error", "No pending booking found");
        return res.redirect("/listings");
    }

    res.render("bookings/payment.ejs", { booking });
};

// ================================
// PROCESS PAYMENT (Demo Mode)
// ================================

module.exports.processPayment = async (req, res) => {
    try {
        const pendingBooking = req.session.pendingBooking;

        if (!pendingBooking) {
            return res.json({ success: false, message: "No pending booking found" });
        }

        // Create the booking in database
        const newBooking = new Booking({
            bookingType: pendingBooking.type,
            guest: req.user._id,
            checkIn: new Date(pendingBooking.checkIn),
            checkOut: new Date(pendingBooking.checkOut),
            guests: pendingBooking.guests,
            basePrice: pendingBooking.basePrice,
            serviceFee: pendingBooking.serviceFee,
            taxes: pendingBooking.taxes,
            totalPrice: pendingBooking.totalPrice,
            paymentStatus: 'completed',
            paymentId: 'DEMO_' + Date.now(),
            status: 'confirmed',
            reservationTime: pendingBooking.reservationTime
        });

        // Set the reference based on booking type
        if (pendingBooking.type === 'listing') {
            newBooking.listing = pendingBooking.itemId;
        } else if (pendingBooking.type === 'vehicle') {
            newBooking.vehicle = pendingBooking.itemId;
        } else if (pendingBooking.type === 'dhaba') {
            newBooking.dhaba = pendingBooking.itemId;
        }

        await newBooking.save();

        // Clear the pending booking from session
        delete req.session.pendingBooking;

        res.json({
            success: true,
            bookingId: newBooking._id,
            message: "Payment successful!"
        });

    } catch (error) {
        console.error("Process payment error:", error);
        res.json({ success: false, message: "Payment processing failed" });
    }
};

// ================================
// SHOW BOOKING DETAILS
// ================================

module.exports.showBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('listing')
            .populate('vehicle')
            .populate('dhaba')
            .populate('guest');

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/bookings");
        }

        // Check authorization
        if (!booking.guest._id.equals(req.user._id)) {
            req.flash("error", "You are not authorized to view this booking");
            return res.redirect("/bookings");
        }

        res.render("bookings/show.ejs", { booking });

    } catch (error) {
        console.error("Show booking error:", error);
        req.flash("error", "Failed to load booking");
        res.redirect("/bookings");
    }
};

// ================================
// GET USER'S BOOKINGS
// ================================

module.exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ guest: req.user._id })
            .populate('listing')
            .populate('vehicle')
            .populate('dhaba')
            .sort({ createdAt: -1 });

        res.render("bookings/index.ejs", { bookings });

    } catch (error) {
        console.error("Get bookings error:", error);
        req.flash("error", "Failed to load bookings");
        res.redirect("/listings");
    }
};

// ================================
// CANCEL BOOKING
// ================================

module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/bookings");
        }

        if (!booking.guest.equals(req.user._id)) {
            req.flash("error", "You are not authorized to cancel this booking");
            return res.redirect("/bookings");
        }

        // Check cancellation policy (24 hours before check-in)
        const now = new Date();
        const checkIn = new Date(booking.checkIn);
        const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

        if (hoursUntilCheckIn < 24) {
            req.flash("error", "Cannot cancel booking less than 24 hours before check-in");
            return res.redirect(`/bookings/${id}`);
        }

        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        await booking.save();

        req.flash("success", "Booking cancelled successfully! Refund will be processed within 5-7 business days.");
        res.redirect("/bookings");

    } catch (error) {
        console.error("Cancel booking error:", error);
        req.flash("error", "Failed to cancel booking");
        res.redirect("/bookings");
    }
};
