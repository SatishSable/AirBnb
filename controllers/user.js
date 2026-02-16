const User = require("../models/user");

module.exports.rendersignup = (req, res) => {
  res.render("user/signup.ejs");
}

module.exports.singup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registerUser = await User.register(newUser, password);

    // Log successful user creation to MongoDB Atlas
    console.log("✅ NEW USER CREATED IN MONGODB ATLAS:");
    console.log(`   - Username: ${registerUser.username}`);
    console.log(`   - Email: ${registerUser.email}`);
    console.log(`   - User ID: ${registerUser._id}`);
    console.log(`   - Created At: ${registerUser.createdAt}`);
    console.log(`   - Role: ${registerUser.role}`);

    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    })
  } catch (e) {
    console.log("❌ USER CREATION FAILED:", e.message);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}

module.exports.renderLogin = (req, res) => {
  res.render("user/login.ejs");
}

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings"
  res.redirect(redirectUrl);

}

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
}
