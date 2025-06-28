const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOvrride = require("method-override");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

app.use(express.json());  // Good practice

// DB connection
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(err => {
    console.error("Connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOvrride("_method"));

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am route");
});

// index route
app.get("/listings" , async (req ,res) => {
     const allListings = await  Listing.find({});
    res.render("./listings/index.ejs" , {allListings});
 
});

// New route
app.get("/listings/new" , (req, res) => {
  res.render("./listings/new.ejs");
});

// show route
app.get("/listings/:id" , async(req ,res) => {
let {id} = req.params;
const listing = await Listing.findById(id);
res.render("./listings/show.ejs", {listing});
});

// create route
app.post("/listings" , async(req ,res)=>{
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("./listings");
  
});

// edit route

app.get("/listings/:id/edit" , async(req ,res) => {
  let {id} = req.params;
const listing = await Listing.findById(id);
res.render("listings/edit.ejs" , {listing});
});

// update route

app.put("/listings/:id" , async(req ,res) => {
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id , {...req.body.listing});
  redirect("/listings");
})


// Sample Listing
// app.get("/testListing", async (req, res) => {
//   let sampleListings = new Listing({
//     title: "My new villa",  // fixed spelling
//     description: "By the beach",
//     price: 1200,
//     location: "Pune",
//     country: "India"
//   });

//   await sampleListings.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// });

// Server Start
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
