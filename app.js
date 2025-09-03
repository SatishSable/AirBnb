if(process.env.NODE_ENV !== "production"){
require("dotenv").config();

}

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
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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
// app.get("/", (req, res) => {
//   res.send("Hi, I am route");
// });



app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use the local strategy for authentication


// Serialize and deserialize user for session management
passport.serializeUser(User.serializeUser());       // ✅ required
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next ) => {
  res.locals.success = req.flash("success");
 res.locals.error = req.flash("error");
 res.locals.currUser = req.user; // Make current user available in templates
  next();
});

// app.get("/demouser" , async(req , res)=> {
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"sigma-student"
//   });
//  let registerUser = await User.register(fakeUser , "helloworld");
//   res.send(registerUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


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
