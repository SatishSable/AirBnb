const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userControllers = require("../controllers/user.js")



router.get("/signup", userControllers.rendersignup);

router.post("/signup" , wrapAsync(userControllers.singup));

router.get("/login" , userControllers.renderLogin);

router.post("/login" ,
   saveRedirectUrl ,
    passport.authenticate("local" ,
       {failureRedirect : '/login' ,
         failureFlash : true
        }) ,
         userControllers.login
 );

router.get("/logout", userControllers.logout)


module.exports = router;