const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creator_username: { type: String, required: false },
    title: { type: String, required: false, default: "" },
    latitude: { type: mongoose.Schema.Types.Number, required: false },
    longitude: { type: mongoose.Schema.Types.Number, required: false },
    rating: { type: mongoose.Schema.Types.Number, required: false },
    total_votes: { type: mongoose.Schema.Types.Number, required: true },
    published: { type: Boolean, required: true, default: false }
}, { collection: 'Guides' });

module.exports = mongoose.model('Guides', GuideSchema);