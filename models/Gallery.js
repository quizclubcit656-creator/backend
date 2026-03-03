const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String },
    year: { type: Number, required: true },
    imageUrl: { type: String },
    photos: [{ type: String }],
}, { timestamps: true });
GallerySchema.index({ year: 1, date: -1 });

module.exports = mongoose.model('Gallery', GallerySchema);
