const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: false },
    venue: { type: String, required: false },
    participants: { type: String, required: false },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    isUpcoming: { type: Boolean, default: true },
    googleFormUrl: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
