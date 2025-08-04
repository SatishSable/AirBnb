const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override"); // fixed spelling
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

// Middleware
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Set view engine and views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs' , ejsMate);
app.use(express.static(path.join(__dirname , "/public")))

// Connect to MongoDB
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

// Session configuration
const sessionOptions = {    
  secret : "mysupersecretcode",
  resave : false,
  saveUninitialized : true,
  cookie: {
   expries: Date.now() + 7 * 24 * 60 *60 *1000,
    maxAge: 7 * 24 * 60 *60 *1000,// 1 day
    httpOnly: true, // prevents client-side JavaScript from accessing the cookie
  },

}

// Home route
app.get("/", (req, res) => {
  res.send("Hi, I am route");
});

app.use(session(sessionOptions));
app.use(flash());


app.use((req,res,next ) => {
  res.locals.success = req.flash("success");
 res.locals.error = req.flash("error");
  next();
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews );


// error handling middleware
app.use((err, req, res, next)=>{
  let{ statusCode = 500  , message = "something went wrong!" } = err;
//  res.status(statusCode).send(message);
    res.render("error.ejs" , {err});
})


// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
