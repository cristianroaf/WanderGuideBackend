const mongoose = require('mongoose');

const Rating = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    guide_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Guides' },
    rate: { type: mongoose.Schema.Types.Number, required: true },
}, { collection: 'Ratings' });


module.exports = mongoose.model('Ratings', Rating)