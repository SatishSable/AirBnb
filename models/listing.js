const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://www.istockphoto.com/photos/sea",
            set: (v) =>
                v === "" ? "https://www.istockphoto.com/photos/sea" : v,
        },
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Review",
        }
    ]
});
listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
