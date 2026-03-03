const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const path = require('path');
const { Readable } = require('stream');

/* ===============================
   MULTER CONFIG (Memory Storage)
================================= */

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files allowed'));
        }
        cb(null, true);
    }
});

/* ===============================
   🔹 Upload Image (GridFS Only)
================================= */

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Convert file buffer to base64 Data URI
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const imageUrl = `data:${mimeType};base64,${base64Image}`;

        return res.status(200).json({
            message: 'Image processed successfully',
            imageUrl
        });

    } catch (err) {
        console.error('Upload processing error:', err);

        if (!res.headersSent) {
            return res.status(500).json({ message: 'Server error processing image' });
        }
    }
});

/* ===============================
   🔹 Get Image from GridFS
================================= */

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

        let contentType = files[0].contentType;

        if (
            !contentType ||
            contentType === 'application/octet-stream' ||
            contentType === 'binary/octet-stream'
        ) {
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

        // Set headers so browser displays image instead of downloading
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${req.params.filename}"`,
            'Cache-Control': 'public, max-age=31536000'
        });

        const downloadStream =
            bucket.openDownloadStreamByName(req.params.filename);

        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error(err);

            if (!res.headersSent) {
                return res.status(500).json({ message: 'Error retrieving image' });
            }
        });

    } catch (err) {
        console.error(err);

        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error retrieving image' });
        }
    }
});

module.exports = router;