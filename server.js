require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
console.log(`[DEBUG] Server starting on port ${PORT}...`);
console.log(`[DEBUG] __dirname: ${__dirname}`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[ROUTE-DEBUG] ${req.method} ${req.url}`);
    next();
});

app.get('/api/early-debug', (req, res) => {
    res.json({ message: 'Early debug works!', time: new Date().toISOString() });
});

// Routes
const eventsRouter = require('./routes/events');
const contactsRouter = require('./routes/contacts');
const authRouter = require('./routes/auth');
const createCrudRouter = require('./routes/crudRouter');
const uploadRouter = require('./routes/uploadRouter');
const bannerRouter = require('./routes/banner');
const teamRoutes = require('./routes/team');
const highlightsRouter = require('./routes/highlights');

app.use('/uploads', express.static('uploads'));
app.use('/api/events', eventsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/team', teamRoutes);
app.use('/api/highlights', highlightsRouter);

app.get('/api/health-check', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        bannerRouteRegistered: true
    });
});

// Register dynamic CRUD routes
app.use('/api/achievements', createCrudRouter(require('./models/Achievement')));
app.use('/api/gallery', createCrudRouter(require('./models/Gallery')));
app.get('/api/test-team', (req, res) => res.json({ message: 'Team test works' }));

// Page Content requires finding by pageName, so let's just make a specific route for it or adapt the generic
const buildPageContentRouter = () => {
    const r = require('express').Router();
    const PageContent = require('./models/PageContent');
    const auth = require('./middleware/auth');

    r.get('/:pageName', async (req, res) => {
        try {
            let doc = await PageContent.findOne({ pageName: req.params.pageName });
            if (!doc) return res.json({});
            res.json(doc.sections);
        } catch (e) { res.status(500).send(e.message); }
    });

    r.post('/:pageName', auth, async (req, res) => {
        try {
            let doc = await PageContent.findOne({ pageName: req.params.pageName });
            if (!doc) doc = new PageContent({ pageName: req.params.pageName });
            doc.sections = { ...doc.sections, ...req.body };
            await doc.save();
            res.json(doc.sections);
        } catch (e) { res.status(500).send(e.message); }
    });
    return r;
};
app.use('/api/page-content', buildPageContentRouter());

// ✅ Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO:", process.env.MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:");
        console.error(err.message);
        process.exit(1);
    });