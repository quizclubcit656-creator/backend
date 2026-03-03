require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_club';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected. Seeding data...');

        // Clear existing
        await Event.deleteMany({});

        // Insert dummy event with a google form link
        await Event.create({
            title: 'Mega Quiz Tournament',
            date: 'May 10, 2026',
            time: '11:00 AM',
            venue: 'Online',
            participants: 'Open to everyone',
            description: 'An exciting online quiz event. Make sure to register via the Google Form.',
            isUpcoming: true,
            googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLS.../viewform' // Example URL
        });

        console.log('Successfully seeded database with example Event!');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
