const express = require('express');
const router = express.Router();
const fs = require("fs");
const multer = require('multer');
const Profile = require('../models/Profile')
const ProfileImage = require('../models/ProfileImage');
var upload = multer();

//Get the profile info
router.get('/:id', async (req, res) => {
    id = req.params.id;
    try {
        const profile = await Profile.findById({ _id: id });
        if (isEmpty(profile)) {
            res.status(403).json("Profile does not exist");
        } else {
            res.status(200).json(profile);
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(421).json("Unexpected error");
    }
});

//Modify the profile info
router.post('/:id', async (req, res) => {
    id = req.params.id;
    const profile = await Profile.findById({ _id: id });
    if (isEmpty(profile)) {
        res.status(403).json("Profile does not exist");
    } else {
        try {
            //Modify the profile with that id
            const updatedProfile = await Profile.findByIdAndUpdate({ _id: id }, {
                name: req.body.name,
                description: req.body.description,
                age: req.body.age
            });
            return res.status(200).json(updatedProfile);
        }
        catch (err) {
            console.log(err);
            return res.status(400).json("error");
        }


    }
    return res.status(400).json("error");
});

//Get the image of the profile
router.get('/:id/image', async (req, res) => {
    id = req.params.id;
    try {
        const profileImage = await ProfileImage.findById({ _id: id });
        if (isEmpty(profileImage)) {
            res.status(403).json("Profile does not exist");
        } else {
            res.status(200).json(profileImage.data);
        }
    }
    catch (err) {
        console.log(err);
        res.status(421).json("Error inesperado");
    }
});

//Modify the image of the profile
router.post('/:id/image', upload.single('image'), async (req, res) => {
    id = req.params.id;
    const profile = await ProfileImage.findById({ _id: id });
    if (isEmpty(profile)) {
        res.status(403).json("Profile does not exist");
    } else {
        try {
            var base64Image = req.body.buffer;
            var imageBuffer = new Buffer.from(base64Image, "base64");
            //Modify the profile with that id
            const updatedProfile = await ProfileImage.findByIdAndUpdate({ _id: id }, {
                data: imageBuffer,
                contentType: 'image/jpg'
            });
        }
        catch (err) {
            console.log(err);
        }

        res.status(200).json("Image changed successfully");
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
