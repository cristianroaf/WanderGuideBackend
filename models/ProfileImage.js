const mongoose = require('mongoose');

const ProfileImage = new mongoose.Schema({
    data: Buffer,
    contentType: String
}, { collection: 'ProfileImages' });


module.exports = mongoose.model('ProfileImages', ProfileImage)