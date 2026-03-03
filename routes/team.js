const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const auth = require('../middleware/auth');

// GET all team members
router.get('/', async (req, res) => {
    try {
        const team = await TeamMember.find().sort({ order: 1, createdAt: 1 });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new team member
router.post('/', auth, async (req, res) => {
    const teamMember = new TeamMember(req.body);
    try {
        const newMember = await teamMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a team member
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
        res.json(updatedMember);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a team member
router.delete('/:id', auth, async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
