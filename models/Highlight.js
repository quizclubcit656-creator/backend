const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
    type: { type: String, enum: ['event', 'gallery', 'achievement', 'member'], required: true, unique: true },
    isActive: { type: Boolean, default: true },
    pinnedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    refModel: { type: String, enum: ['Event', 'Gallery', 'Achievement', 'TeamMember'] },
    badgeLabel: { type: String },
    buttonText: { type: String },
    descriptionOverride: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Highlight', HighlightSchema);
