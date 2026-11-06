const express = require("express");
const multer = require("multer");

const importAuth = require("../middleware/importAuth");

const {importQuestionsFromCSV} = require("../services/csvImportService");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        if (!file.originalname.toLowerCase().endsWith(".csv")) {
            return callback(new Error("Only CSV files are allowed."));
        }

        callback(null, true);
    },
});

router.post("/import", importAuth, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file using the file field.",
            });
        }

        const report = await importQuestionsFromCSV(req.file.buffer);

        return res.status(200).json({
            success: true,
            message: "CSV import completed.",
            report,
        });
    } catch (error) {
        console.error("CSV import error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "CSV import failed.",
        });
    }
});

module.exports = router;
