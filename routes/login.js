var express = require('express');
const User = require('../models/User');
var crypto = require('crypto');
var router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.body);
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(411).json('Username does not exist');
    else {
        if (user.verified == false) {
            return res.status(412).json("User not verified");
        }
        var hash = crypto.createHash('sha256');
        if (user.password == hash.update(req.body.password).digest('hex')) return res.status(200).send(user);
        else return res.status(410).json('Incorrect password');
    }
});

module.exports = router;
