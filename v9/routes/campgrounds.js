var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");


//campground show
router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
        
    });
    //res.render("campgrounds",{campgrounds:campgrounds});
});


//Campground Create
router.post("/", isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var desc = req.body.desc;
    var newCampground = {name: name, image: image, desc:desc, author:author};
    
    //Create a new campground and save to DB
    Campground.create(newCampground, function(err,newlycreated){
        if(err){
            console.log(err);
        } else{
            //redirect back to campgrounds page
            res.redirect("/campgrounds");           
        }
    });

});

//campground new
router.get("/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});


//Campground show -- MORE INFORMATION ON SPECIFIC THINGS(order has to be after new)
router.get("/:id", function(req,res){
    //find corresponding campground with the id, populate comments with more than object references
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //console.log(foundCampground);
            //render show template with the campground
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});


//EDIT campground + authorization
router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
    });
});


//UPDATE campground
router.put("/:id", checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    //console.log(req.body.campground);
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            //console.log("successful update");
            //console.log(updatedCampground);
            res.redirect("/campgrounds/" + updatedCampground._id);
        }
    });
});


//DESTROY campground
router.delete("/:id", checkCampgroundOwnership, function(req, res){
    
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


function checkCampgroundOwnership(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("back");
        } else{
            if(foundCampground.author.id.equals(req.user._id)){
                next();
            } else {
                res.redirect("back");
            }
        }
    });        
    } else{
        res.redirect("back");
    }
}

module.exports = router;

