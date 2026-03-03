const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    pageName: { type: String, required: true, unique: true },
    sections: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('PageContent', PageContentSchema);
