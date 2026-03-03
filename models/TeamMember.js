const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String },
    category: { type: String, default: 'member' },
    year: { type: String, required: true, default: '2025-26' },
    linkedin: { type: String },
    github: { type: String },
    imageUrl: { type: String },
    description: { type: String },
    department: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
