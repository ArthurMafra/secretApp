//jshint esversion:6


// dotenv needs to be called first of all in the code
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");



const app = express();

// console.log(process.env.SECRET);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

//Remove Mongoose deprecatio warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


mongoose.connect("mongodb://localhost:27017/userDB");

//Set up user Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// const encKey = process.env.SOME_32BYTE_BASE64_STRING;
// const sigKey = process.env.SOME_64BYTE_BASE64_STRING;

//encrypiton key is now set on the enviroment variable


//Plugin needs to be added before creation of mongoose model
userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY , encryptedFields: ["password"]});
//Set up mongoose model based on userSchema
const User = new mongoose.model("User", userSchema);







app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.post("/register", function(req, res){
  // console.log(req.body);
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });

});


app.post("/login", function(req, res){

  const checkingUser = {
    email: req.body.username,
    password: req.body.password
  };

  User.findOne({email: checkingUser.email}, function(err, foundUser){


    if(!err){

        if (foundUser){

          if (foundUser.password === checkingUser.password) {
            res.render("secrets");
          } else {
            console.log("Your password does not match.");
          }
        } else {
          console.log("User not found!");
        }

    } else {
      console.log(err);
    }

  });

});





app.listen(3000, function() {
    console.log("Server started on port 3000.");
});
