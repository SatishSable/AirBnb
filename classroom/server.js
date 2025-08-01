const express = require("express");
const app = express();
const users = require("./routes/users.js");
const posts = require("./routes/posts.js");
const session = require("express-session");   
const flash = require("connect-flash");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
    secret : "mysecret" ,
    resave : false,
    saveUninitialized : true,
};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register" , (req , res) => {
    let {name  = "Guest"} = req.query;
   req.session.name = name;
  req.flash("info" , "user registered successfully");
    res.redirect("/hello");
});
app.get("/hello"  , (req ,res) =>{
    
   res.render("page.ejs" , {name : req.session.name , msg : req.flash("success") });
})

// app.get("/reqcount" , (req ,res ) => {
//     if(req.session.count) {
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`you sent request x ${req.session.count} times`)
// })

// app.get("/test" , (req, res) => {
//     res.send("successfully tested");
// });

app.listen(3000 , () => {
    console.log("server is listening on port 3000");
})