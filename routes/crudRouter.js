const express = require('express');
const auth = require('../middleware/auth');

function createCrudRouter(Model) {
    const router = express.Router();

    // GET all
    router.get('/', async (req, res) => {
        const queryParams = { ...req.query };
        const limitStr = queryParams.limit;
        delete queryParams.limit;

        try {
            let query = Model.find(queryParams).sort({ date: 1, createdAt: -1 });
            if (limitStr) {
                query = query.limit(parseInt(limitStr));
            }
            const items = await query;
            console.log(`GET ${req.baseUrl} | Found ${items.length} items`);
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // GET one by ID
    router.get('/:id', async (req, res) => {
        console.log(`GET ${req.baseUrl}/${req.params.id}`);
        try {
            const item = await Model.findById(req.params.id);
            if (!item) {
                console.log('Item not found');
                return res.status(404).json({ message: 'Not found' });
            }
            console.log('Item found');
            res.json(item);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // POST create new (protected)
    router.post('/', auth, async (req, res) => {
        console.log(`POST ${req.baseUrl} - Body Keys:`, Object.keys(req.body));
        const item = new Model(req.body);
        try {
            const newItem = await item.save();
            console.log('Created successfully');
            res.status(201).json(newItem);
        } catch (err) {
            console.error(`POST ${req.baseUrl} SAVE ERROR:`, err.message);
            if (err.errors) console.error('VALIDATION ERRORS:', Object.keys(err.errors));
            res.status(400).json({ message: err.message, errors: err.errors });
        }
    });

    // PUT update (protected)
    router.put('/:id', auth, async (req, res) => {
        try {
            const item = await Model.findById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Not found' });

            Object.assign(item, req.body);
            const updatedItem = await item.save();
            res.json(updatedItem);
        } catch (err) {
            console.error(`PUT ${req.baseUrl}/${req.params.id} SAVE ERROR:`, err.message);
            if (err.errors) console.error('VALIDATION ERRORS:', Object.keys(err.errors));
            res.status(400).json({ message: err.message, errors: err.errors });
        }
    });

    // DELETE (protected)
    router.delete('/:id', auth, async (req, res) => {
        try {
            const item = await Model.findById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Not found' });

            await item.deleteOne();
            res.json({ message: 'Deleted' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    return router;
}

module.exports = createCrudRouter;
