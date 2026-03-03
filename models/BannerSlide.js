const mongoose = require('mongoose');

const BannerSlideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    label: { type: String },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    buttonText: { type: String },
    buttonLink: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BannerSlide', BannerSlideSchema);
