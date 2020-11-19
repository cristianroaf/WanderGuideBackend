const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require("path");
const User = require('../models/User');
const Profile = require('../models/Profile')
const ProfileImage = require('../models/ProfileImage')
const EmailValidator = require('email-deep-validator');
const mail = require('../gmailAPI/email_validation/email_validation');
var crypto = require('crypto');

const emailValidator = new EmailValidator();

//Register function --- http://IP:3000/register
router.post('/', async (req, res) => {
    var hash = crypto.createHash('sha256');

    //Create the user object
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash.update(req.body.password).digest('hex')
    });
    try {

        //Check if the email is valid
        var { wellFormed, validDomain, validMailbox } = await emailValidator.verify(user.email);
        if (wellFormed && validDomain) {

            //Send the user object to the Database
            const savedUser = await user.save();
            if (isEmpty(savedUser)) {
                res.status(400).json("Internal DB error");
            }

            //Create an empty profile object for that user
            const profile = new Profile({
                _id: savedUser._id,
                name: "",
                description: "",
                age: 0,
                creation_date: Date.now()
            });

            //Send the profile object to the Database
            const savedProfile = await profile.save();
            if (isEmpty(savedProfile)) {
                res.status(400).json("Internal DB error");
            }

            //Create the profile image for the user
            const profileImage = new ProfileImage({
                _id: savedUser._id,
                data: fs.readFileSync(path.resolve(__dirname, '../assets/defaultProfilePic.jpg')),
                contentType: 'image/jpg'
            })
            const savedProfileImage = await profileImage.save();
            if (isEmpty(savedProfileImage)) {
                res.status(400).json("Internal DB error");
            }

            //Send verification email to the registered user
            mail.sendVerificationMessage(savedUser.email, savedUser._id);

            //If everything is correct, return status 200 with the recently created user
            res.status(200).json("Verification email sent");
        }
        else {
            //The email validation did not succeed
            res.status(410).json("Provided email is not valid");
        }
    }
    catch (err) {
        //An error triggered the exception, probably a database restriction
        console.log("err:" + err)
        res.status(411).json("Email or user already in use");
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
