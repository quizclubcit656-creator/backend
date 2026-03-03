const express = require('express');
const router = express.Router();
const Highlight = require('../models/Highlight');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Achievement = require('../models/Achievement');
const TeamMember = require('../models/TeamMember');
const auth = require('../middleware/auth');

// Helper to get default configs
const getDefaultConfigs = () => [
    { type: 'event', refModel: 'Event', badgeLabel: 'Upcoming', buttonText: 'View Event' },
    { type: 'gallery', refModel: 'Gallery', badgeLabel: 'New', buttonText: 'View Gallery' },
    { type: 'achievement', refModel: 'Achievement', badgeLabel: 'Recent', buttonText: 'View Details' },
    { type: 'member', refModel: 'TeamMember', badgeLabel: 'Featured', buttonText: 'View Profile' }
];

router.get('/', async (req, res) => {
    try {
        let highlights = await Highlight.find();
        if (highlights.length === 0) {
            // Drop existing any highlights without type (old schema)
            await Highlight.deleteMany({});
            await Highlight.insertMany(getDefaultConfigs());
            highlights = await Highlight.find();
        }

        // Validate type exists, since old schema docs might linger if not caught by deleteMany
        highlights = highlights.filter(hl => hl.type);

        const populated = await Promise.all(highlights.map(async (hl) => {
            let item = null;
            if (hl.pinnedId) {
                try {
                    switch (hl.type) {
                        case 'event': item = await Event.findById(hl.pinnedId); break;
                        case 'gallery': item = await Gallery.findById(hl.pinnedId); break;
                        case 'achievement': item = await Achievement.findById(hl.pinnedId); break;
                        case 'member': item = await TeamMember.findById(hl.pinnedId); break;
                    }
                } catch (e) {
                    console.error("Error fetching pinned item", e);
                }
            }

            if (!item) {
                // Fetch latest
                switch (hl.type) {
                    case 'event': item = await Event.findOne().sort({ createdAt: -1 }); break;
                    case 'gallery': item = await Gallery.findOne().sort({ createdAt: -1 }); break;
                    case 'achievement': item = await Achievement.findOne().sort({ createdAt: -1 }); break;
                    case 'member': item = await TeamMember.findOne().sort({ createdAt: -1 }); break;
                }
            }

            return {
                _id: hl._id,
                type: hl.type,
                isActive: hl.isActive,
                pinnedId: hl.pinnedId,
                badgeLabel: hl.badgeLabel,
                buttonText: hl.buttonText,
                descriptionOverride: hl.descriptionOverride,
                item: item // Full item data
            };
        }));

        res.json(populated);
    } catch (err) {
        console.error("Highlights GET error:", err);
        res.status(500).json({ message: err.message });
    }
});

router.put('/:type', auth, async (req, res) => {
    try {
        const { isActive, pinnedId, badgeLabel, buttonText, descriptionOverride } = req.body;

        let refModel = 'Event';
        switch (req.params.type) {
            case 'event': refModel = 'Event'; break;
            case 'gallery': refModel = 'Gallery'; break;
            case 'achievement': refModel = 'Achievement'; break;
            case 'member': refModel = 'TeamMember'; break;
        }

        const updated = await Highlight.findOneAndUpdate(
            { type: req.params.type },
            {
                isActive,
                pinnedId: pinnedId || null,
                refModel,
                badgeLabel,
                buttonText,
                descriptionOverride
            },
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/options/:type', auth, async (req, res) => {
    try {
        let items = [];
        switch (req.params.type) {
            case 'event': items = await Event.find().sort({ createdAt: -1 }).select('_id title date'); break;
            case 'gallery': items = await Gallery.find().sort({ createdAt: -1 }).select('_id title date year'); break;
            case 'achievement': items = await Achievement.find().sort({ createdAt: -1 }).select('_id title year'); break;
            case 'member': items = await TeamMember.find().sort({ createdAt: -1 }).select('_id name role category'); break;
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
