const express = require("express");
const multer = require("multer");

const {uploadCpcCsv} = require("../controllers/cpcImportController");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

router.post("/csv", upload.single("file"), uploadCpcCsv);

module.exports = router;
