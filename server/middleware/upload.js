/**
 * Upload Middleware — Multer configuration to handle file uploads.
 * Accepts only .csv, .xlsx, and .xls files.
 */

const multer = require('multer');
const path = require('path');

// Store files in memory (no disk write needed; we parse immediately)
const storage = multer.memoryStorage();

/**
 * File filter: only allow csv, xlsx, and xls extensions.
 */
function fileFilter(_req, file, cb) {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

module.exports = upload;
