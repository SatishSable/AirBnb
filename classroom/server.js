const express = require("express");
const app = express();
const users = require("./routes/users.js");
const posts = require("./routes/posts.js");
const cookiesParser = require("cookie-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser("yourSecret"));


app.use(cookiesParser());

app.get("/getsignedcookies" , (req ,res) => {
    res.cookie("made-in" , "india" , {signed : true});
    res.send("signed cookie set");
})

app.get("/getcookies" , (req ,res) => {
    res.cookie("greet", "cookie");
    res.cookie("madein", "india");
    res.send("cookie, set");
});

app.get("/greet", (req ,res) => {
    let {name = "Guest"} = req.cookies;     
    res.send(`Hello ${name}`);
})

app.get("/" , (req ,res) => {
    console.dir(req.cookies);
    res.send("hi , i am root ");
});


app.use("/users" , users);  
app.use("/posts" , posts);  







app.listen(3000 , () => {
    console.log("server is listening on port 3000");
})