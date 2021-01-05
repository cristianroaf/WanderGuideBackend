const express = require('express');
const router = express.Router();
const Guide = require('../models/Guide');
const Stop = require('../models/Stop');
const User = require('../models/User');
const Rating = require('../models/Rating')

//Gets all the guides that are published
router.get('/', async (req, res) => {
    try {
        const Guides = await Guide.find({ published: true });
        if (isEmpty(Guides)) {
            res.status(201).json("There are no published guides yet");
        } else {
            res.status(200).json(Guides);
        }
    }
    catch (err) {
        res.status(421).json("Error inesperado");
    }
});

//Gets the guide object with that id
router.get('/:guide_id', async (req, res) => {
    guideId = req.params.guide_id;
    try {
        //Get the guide
        var foundGuide = await Guide.findById({ _id: guideId });
        if (isEmpty(foundGuide)) {
            res.status(201).json("There is no guide with that id");
        } else {
            res.status(200).json(foundGuide);
        }
    }
    catch (err) {
        res.status(421).json("Error inesperado");
    }
});

//Gets the stop list of that guide
router.get('/:guide_id/stops', async (req, res) => {
    guideId = req.params.guide_id;
    try {
        //Get the guide
        var foundStops = await Stop.find({ guide_id: guideId });
        if (isEmpty(foundStops)) {
            res.status(201).json("There is no guide with that id");
        } else {
            res.status(200).json(foundStops);
        }
    }
    catch (err) {
        console.log(err);
        res.status(421).json("Error inesperado");
    }
});

//Get draft guide objet of an user
router.get('/:id/draft/guide', async (req, res) => {
    id = req.params.id;
    try {
        //Get the guide
        var foundGuide = await Guide.findOne({ user_id: id, published: false });
        if (isEmpty(foundGuide)) {
            res.status(201).json("There is no draft guide for that user");
        } else {
            res.status(200).json(foundGuide);
        }
    }
    catch (err) {
        console.log(err);
        res.status(421).json("Error inesperado");
    }
});
//Gets the draft guide stops of the user
router.get('/:id/draft/stops', async (req, res) => {
    id = req.params.id;
    try {
        //Get the guide
        var foundGuide = await Guide.findOne({ user_id: id, published: false });
        if (isEmpty(foundGuide)) {
            res.status(201).json("There is no draft guide for that user");
        } else {
            var Stops = await Stop.find({ guide_id: foundGuide._id });
            if (!isEmpty(Stops)) {
                res.status(200).json(Stops);
            }
            else {

                res.status(201).json("DB error");
            }
        }
    }
    catch (err) {
        res.status(421).json("Error inesperado");
    }
});

//Delete a guide
router.post('/:guide_id/delete', async (req, res) => {
    guide_id = req.params.guide_id;
    user_id = req.body.user_id;
    var foundGuide = await Guide.findOneAndDelete({ _id: guide_id, user_id: user_id, published: false });
    //Its a draft
    if (!isEmpty(foundGuide)) {
        var foundStops = await Stop.deleteMany({ guide_id: guide_id });
        res.status(200);
    } else {
        //It's a published guide
        var foundGuide = await Guide.findOneAndDelete({ _id: guide_id, user_id: user_id, published: true });
        if (!isEmpty(foundGuide)) {
            var foundStops = await Stop.deleteMany({ guide_id: guide_id });
            var foundRating = await Rating.deleteMany({ guide_id: guide_id });
        }
        res.status(200);

    }
    res.status(200).json("Guide and stops deleted successfully");
});

//Delete a stop
router.post('/stop/:id/delete', async (req, res) => {
    id = req.params.id;
    var foundStop = await Stop.findByIdAndRemove({ _id: id });
    res.status(200).json("Deleted successfully");
});

//Publishes the draft guide of the user
router.post('/:id/publish', async (req, res) => {
    id = req.params.id;
    try {
        var foundGuide = await Guide.findOne({ user_id: id, published: false });
        if (!isEmpty(foundGuide)) {
            var foundStops = await Stop.find({ guide_id: foundGuide._id });
            if (!isEmpty(foundStops)) {
                var latitude = 0;
                var longitude = 0;
                for (i = 0; i < foundStops.length; i++) {
                    latitude += foundStops[i].latitude;
                    longitude += foundStops[i].longitude;
                }
                var user = await User.findById({ _id: id });
                console.log(user);
                var foundGuide = await Guide.findOneAndUpdate({ user_id: id, published: false }, {
                    published: true,
                    longitude: longitude / foundStops.length,
                    latitude: latitude / foundStops.length,
                    creator_username: user.username
                });
            }
            res.status(200).json(foundGuide);
        }
    } catch (err) {
        console.log(err);
        res.status(421).json("error");
    }
});

//Updates the title of a draft guide
router.post('/:id/draft/title', async (req, res) => {
    id = req.params.id;

    try {
        var foundGuide = await Guide.findOne({ user_id: id, published: false });
        console.log(foundGuide);
        //If it doesn't, create a new guide
        if (isEmpty(foundGuide)) {
            const newGuide = new Guide({
                rating: 0,
                total_votes: 0,
                published: false,
                user_id: id,
                latitude: 0,
                longitude: 0,
                title: req.body.title
            });
            foundGuide = await newGuide.save();
        } else {
            var updatedguide = await Guide.findOneAndUpdate({ user_id: id, published: false },
                {
                    title: req.body.title
                });
        }
        res.status(200).json("Ok");
    } catch (err) {
        res.status(400).json("failed to update title");
    }

});

//Adds a stop to the draft guide of the user, if it does not exist, creates a new not published guide.
    router.post('/:id/draft', async (req, res) => {
        id = req.params.id;
        console.log(req.body.latitude);
        lat = (req.body.latitude).replace(/,/g, ".");
        lng = (req.body.longitude).replace(/,/g, ".");
        try {
            //Check is a draft of the guide exists
            var foundGuide = await Guide.findOne({ user_id: id, published: false });
            //If it doesn't, create a new guide
            if (isEmpty(foundGuide)) {
                const newGuide = new Guide({
                    rating: 0,
                    total_votes: 0,
                    published: false,
                    user_id: id,
                    latitude: 0,
                    longitude: 0,
                    title: ""
                });
                foundGuide = await newGuide.save();
            }
            //Now create the specified stop
            var newStop = new Stop({
                title: req.body.title,
                description: req.body.description,
                latitude: lat,
                longitude: lng,
                guide_id: foundGuide._id
            });
            var savedStop = await newStop.save();
            if (!isEmpty(savedStop)) {
                res.status(200).json("OK");
            }
            else {
                res.status(400).json("error");
            }
        } catch (err) {
            console.log(err);
            res.status(421).json("error");
        }
    });
    //Rates a guide and creates rate object.
    router.post('/rate', async (req, res) => {
        user_id = req.body.user_id;
        guide_id = req.body.guide_id;
        rate = parseFloat(req.body.rate);
        try {
            var foundGuide = await Guide.findOne({ _id: guide_id, published: true });
            if (isEmpty(foundGuide)) {
                res.status(201).json("The guide does not exist");
            }
            else {
                var foundGuide = await Guide.findOne({ _id: guide_id, user_id: user_id });
                if (!isEmpty(foundGuide)) {
                    res.status(202).json("You can't rate your own guide");
                }
                else {
                    var foundRating = await Rating.findOne({ guide_id: guide_id, user_id: user_id });
                    console.log(foundRating);
                    if (!isEmpty(foundRating)) {
                        res.status(203).json("User already rated this guide");
                    }
                    else {
                        var foundGuide = await Guide.findOne({ _id: guide_id, published: true });
                        if (!isEmpty(foundGuide)) {
                            var total_votes = parseFloat(foundGuide.total_votes);
                            var rating = parseFloat(foundGuide.rating);

                            var new_rating = ((total_votes * rating) + rate) / (total_votes + 1);
                            var new_total_votes = total_votes + 1;

                            console.log(new_rating);
                            console.log(new_total_votes);

                            var UpdatedGuide = await Guide.findOneAndUpdate({ _id: guide_id, published: true }, {
                                total_votes: new_total_votes,
                                rating: new_rating
                            });

                            var foundGuide = await Guide.findOne({ _id: guide_id, published: true });
                            if (!isEmpty(UpdatedGuide)) {
                                var new_rating = new Rating({
                                    user_id: user_id,
                                    guide_id: guide_id,
                                    rate: rate
                                });
                                const savedRating = await new_rating.save();
                                res.status(200).json("Rated successfully");
                            } else {
                                //Didn't update successfully
                                throw new Exception();
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err)
            res.json(400).send(err);
        }
    });

    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
module.exports = router;
