const express = require("express");

const {
    getQuestions,
    submitAnswer,
} = require("../controllers/questionController");

const router = express.Router();

router.get("/", getQuestions);
router.post("/answer", submitAnswer);

module.exports = router;
