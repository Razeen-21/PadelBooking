const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000;
const ejs = require("ejs");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/padelDB");
const md5 = require("md5");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
var session;

//Booking Schema
const bookingSchema = new mongoose.Schema({
    players: [String],
    result: String
});
const Booking = mongoose.model("Booking", bookingSchema);
//User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    playerRating: Number,
    bookings: [bookingSchema]
});
const User = mongoose.model("User", userSchema);
//Club Schema
const clubSchema = new mongoose.Schema({
    name: String,
    address: String,
    numberOfCourts: Number,
    imageName: String
});
const Club = mongoose.model("Club", clubSchema);


var currentDate = new Date();
var currentYear = currentDate.getFullYear();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: 1000*60*60^24 },
    resave: false}));



//Beginning of get requests
app.get("/", (req,res) => {
    res.redirect("/welcome");
});

app.get("/clubs", (req, res) => {
    res.render("clubs", {currentYear: currentYear});
});

app.get("/welcome", (req,res) => {
    res.render("welcome", {currentYear: currentYear});
});

app.get("/login", (req,res) => {
    res.render("login", {currentYear: currentYear});
});

app.get("/logout", (req,res) =>{
        req.session.destroy();
        session="";
        res.redirect('/login');
});

app.get("/profile", (req,res) => {
    res.render("profile", {currentYear: currentYear});
});

app.get("/register", (req,res) => {
    res.render("register", {currentYear: currentYear});
});

app.get("/home", (req,res) => {
    res.render("home",  {currentYear: currentYear});
});
//End of get Requests

app.post("/register", (req, res) => {

    const user = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.fullName,
        playerRating: req.body.rating,
        bookings: []
    });
    user.save();
    res.redirect("/home");
});

app.post("/login", (req,res) => {
    
    console.log('====================================');
    console.log("IN LOGIN POST REQUEST");
    console.log('====================================');
    User.findOne({email: req.body.email}).then(foundUser => {

        if(foundUser === null){
            console.log('====================================');
            console.log("LOGIN FAILED: NO USER FOUND");
            console.log('====================================');
            res.redirect("/login"); 
        }

        else if(foundUser !== null) {
        console.log(foundUser);
        const password = foundUser.password;
        

        if(req.body.password === password){

            session = req.session;
            session.email = foundUser.email;
            session.userId = foundUser.id;
            console.log("SESSION")
            console.log(session);

            console.log('====================================');
            console.log("LOGIN SUCCESSFUL");
            console.log('====================================');

            res.redirect("/home");
        }
        else{
            console.log('====================================');
            console.log("LOGIN FAILED: INCORRECT PASSWORD");
            console.log('====================================');
            res.redirect("/login");
        }
    }
      });
});


//Booking Endpoints

app.post("/create/booking", (req,res) =>{
    console.log('====================================');
    console.log('Creating booking for user ');
    console.log('====================================');
    const booking = new Booking({
        players: req.body.players, 
        result: ""});
    booking.save().then((createdBooking)=>{
        if(createdBooking===null){
            res.status(500).send("Failed to create booking.");
        }
        else{
            res.status(201).send("Booking created successfully.");
        }
    })
    //res.redirect("/home");
});

app.put("/update/booking/result", (req,res) => {
    console.log("id: " + req.body.id);
    console.log("updated result " + req.body.result);

    Booking.findByIdAndUpdate(req.body.id,{result: req.body.result})
    .then(updatedBooking => {
        if(updatedBooking === null){
            console.log("Failed to update booking result.");
            res.status(500).send("Failed to update booking result.");
        }
        else{
            console.log("Booking result successfully updated.");
            console.log(updatedBooking);
            res.status(200).send("Booking result successfully updated." + updatedBooking);
        }
    });

    //res.redirect("/home");
});
app.post("/fetch/bookings", (req,res) => {
    console.log('====================================');
    console.log('Fetching bookings for user ');
    console.log('====================================');

    User.findById(req.body.id, 'bookings').then(bookings => {
        if(bookings === null){
            console.log("Failed to fetch bookings.");
            console.log(bookings);
            res.status(500).send("Failed to fetch bookings.");
        }
        else{
            console.log("Bookings successfully fetched.");
            console.log(bookings);
            res.status(200).send(bookings);
        }
    });
//res.redirect("/home");
});
app.delete("/delete/booking", (req,res)=>{
    console.log('====================================');
    console.log('Deleting booking for user ');
    console.log('====================================');

    Booking.findByIdAndDelete(req.body.id).then(deletedBooking => {
        if(deletedBooking === null){
            console.log("Failed to delete booking.");
            console.log(deletedBooking);
            res.status(500).send("Failed to delete booking.");
        }
        else{
            console.log("Booking successfully deleted.");
            console.log(deletedBooking);
            res.status(200).send(deletedBooking);
        }
    });
//res.redirect("/home");
});

app.get("/fetch/clubs", (req,res) =>{
    console.log('====================================');
    console.log("Fetching All Clubs");
    console.log('====================================');

    Club.find().then(clubs => {
        if(clubs === null){
            console.log("Failed to fetch clubs.");
            console.log(clubs);
            res.render("clubs", {clubs: clubs});
        }
        else{
            console.log("Clubs successfully fetched.");
            console.log(clubs);
            res.render("clubs", {currentYear: currentYear,
                clubs: clubs});
        }
    });
});

//End of post requests

app.listen(port, () => {
    console.log("Listening on port", port);
});