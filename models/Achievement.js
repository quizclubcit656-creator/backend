const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    year: { type: String },
    color: { type: String, default: 'from-gold to-yellow-500' },
    icon: { type: String, default: 'Trophy' },
    imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
