const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const files = await bucket.find({}).toArray();
    console.log("FILES IN GRIDFS:");
    files.forEach(f => {
        console.log(JSON.stringify(f, null, 2));
    });
    process.exit(0);
});
