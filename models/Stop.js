const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({

    guide_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    latitude: { type: mongoose.Schema.Types.Number, required: true },
    longitude: { type: mongoose.Schema.Types.Number, required: true },
}, { collection: 'Stops' });

module.exports = mongoose.model('Stops', StopSchema);