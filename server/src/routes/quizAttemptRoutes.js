const express = require("express");

const {
    saveQuizAttempt,
    getQuizHistory,
    getDailyProgress,
} = require("../controllers/quizAttemptController");

const router = express.Router();

router.post("/", saveQuizAttempt);
router.get("/", getQuizHistory);
router.get("/progress", getDailyProgress);

module.exports = router;
