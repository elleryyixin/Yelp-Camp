var   express = require("express"),
          app = express(),
   bodyParser = require("body-parser"),
     mongoose = require("mongoose"),
     passport = require("passport"),
localStrategy = require("passport-local"),
   Campground = require("./models/campground"),
      Comment = require("./models/comment"),
         User = require("./models/user"),
methodOverride = require("method-override"),
      seedDB  = require("./seeds");
mongoose.connect("mongodb://localhost/yelp_camp_v8", { useNewUrlParser: true });

//seedDB();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//possport config
app.use(require("express-session")({
    secret: "Lily is the cutest cat.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

//insert the middleware to every route
app.use(function(req, res, next){
    //res.locals can be put into every template
    res.locals.currentUser = req.user;
    next();
});

app.use("/",indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});