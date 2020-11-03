const mongoose = require('mongoose');

const Profile = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    profile_image: { data: Buffer, contentType: String },
    name: { type: String, required: false },
    description: { type: String, required: false },
    age: { type: Number, required: false },
    creation_date: { type: Date, required: true }
}, { collection: 'Profiles' });


module.exports = mongoose.model('Profiles', Profile)