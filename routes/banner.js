const express = require('express');
const router = express.Router();
const BannerSlide = require('../models/BannerSlide');
const auth = require('../middleware/auth');

// GET all active slides (Public)
router.get('/', async (req, res) => {
    try {
        const slides = await BannerSlide.find({ isActive: true }).sort({ order: 1 });
        res.json(slides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all slides (Admin)
router.get('/admin', auth, async (req, res) => {
    try {
        const slides = await BannerSlide.find().sort({ order: 1 });
        res.json(slides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new slide
router.post('/', auth, async (req, res) => {
    const slide = new BannerSlide(req.body);
    try {
        const newSlide = await slide.save();
        res.status(201).json(newSlide);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update slide
router.put('/:id', auth, async (req, res) => {
    try {
        const slide = await BannerSlide.findById(req.params.id);
        if (!slide) return res.status(404).json({ message: 'Not found' });

        Object.assign(slide, req.body);
        const updatedSlide = await slide.save();
        res.json(updatedSlide);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE slide
router.delete('/:id', auth, async (req, res) => {
    try {
        const slide = await BannerSlide.findById(req.params.id);
        if (!slide) return res.status(404).json({ message: 'Not found' });

        await slide.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH reorder slides
router.patch('/reorder', auth, async (req, res) => {
    const { orders } = req.body; // Expecting [{ id, order }, ...]
    try {
        const promises = orders.map(async (item) => {
            return BannerSlide.findByIdAndUpdate(item.id, { order: item.order });
        });
        await Promise.all(promises);
        res.json({ message: 'Reordered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
