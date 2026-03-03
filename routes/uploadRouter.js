const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const path = require('path');
const { Readable } = require('stream');


// Store file in memory temporarily (NOT in folder)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files allowed'));
        }
        cb(null, true);
    }
});





// 🔹 Upload Image (Stored Directly in MongoDB GridFS)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const db = mongoose.connection.db;
        if (!db) {
            return res.status(500).json({ message: 'Database not connected' });
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads'
        });

        const uniqueName =
            crypto.randomBytes(16).toString('hex') +
            path.extname(req.file.originalname);

        const uploadStream = bucket.openUploadStream(uniqueName, {
            contentType: req.file.mimetype
        });

        // Convert buffer to stream
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        readableStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
            // Use relative routing. As long as VITE_API_URL or a proxy is used in production,
            // returning just the path allows the frontend to prepend its own base URL or handle it gracefully.
            const imageUrl = `/api/upload/image/${uniqueName}`;

            res.status(200).json({
                message: 'Image uploaded successfully',
                imageUrl
            });
        });

        uploadStream.on('error', (err) => {
            console.error('Upload error:', err);
            res.status(500).json({ message: 'Upload failed' });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }



    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const fileUrl = `data:${mimeType};base64,${base64Image}`;

    res.json({ imageUrl: fileUrl });

});


// 🔹 Get Image from MongoDB
router.get('/image/:filename', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        if (!db) {
            return res.status(500).json({ message: 'Database not connected' });
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads'
        });

        const files = await bucket.find({
            filename: req.params.filename
        }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Determine content-type properly
        let contentType = files[0].contentType;
        if (!contentType || contentType === 'application/octet-stream' || contentType === 'binary/octet-stream') {
            const ext = path.extname(req.params.filename).toLowerCase();
            const mimeTypes = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml'
            };
            contentType = mimeTypes[ext] || 'application/octet-stream';
        }

        // Add headers for browsers to display instead of download
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${req.params.filename}"`,
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year to improve performance
        });

        const downloadStream =
            bucket.openDownloadStreamByName(req.params.filename);

        downloadStream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving image' });
    }
});

module.exports = router;
