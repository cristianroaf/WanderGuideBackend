const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fs = require('fs');
const mail = require('../gmailAPI/password_recovery/password_recovery_email')
const crypto = require('crypto');

//Validate user account
router.get('/:id/validate', async (req, res) => {
    id = req.params.id;
    console.log(id);
    try {
        const userToVerify = await User.findById({ _id: id });
        if (isEmpty(userToVerify)) {
            res.status(403).json("User does not exist");
        } else {
            var verifiedUser = await User.findByIdAndUpdate({ _id: id }, {
                verified: true
            });
            res.status(200).json("User verified correctly");
        }
    }
    catch (err) {
        res.status(421).json("Error inesperado");
    }
});

//Password update (accessed through the html form)
router.post('/updatepwd', async (req, res) => {

    var id = req.body.id;
    var pwd = req.body.pwd;
    var hash = crypto.createHash('sha256');
    try {
        const userModificado = await User.findByIdAndUpdate({ _id: id }, {
            password: hash.update(pwd).digest('hex')
        });
    }
    catch (err) {
        console.log(err);
    }
    return res.status(200).send('Password actualizada correctamente');
});

//Ask for the email to recover password
router.post('/recovery', async (req, res) => {
    var email = req.body.email;
    console.log(email);
    const user = await User.find({"email":email});
    console.log(user);
    if (isEmpty(user))
        return res.status(411).json('Provide a correct email');
    else {
        console.log("GMAIL API: Sending recovery email to " + email);
        try {
            mail.sendPasswordRecoveryMessage(email, user._id);
            return res.status(200).json("Recovery email sent");
        } catch (err) {
            return res.status(400).json("Something went wrong!");
        }
    }
});

//Access the web form to recover password
router.get('/recovery', async (req, res) => {

    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('./gmailApi/password_recovery/recovery_form.html', null, function (error, data) {
        if (error) {
            console.log(error);
            res.writeHead(404);
            res.write('Whoops! Something qwnt wrong!');
        } else {
            res.write(data);
        }
        res.end();
    });
});


function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = router;
