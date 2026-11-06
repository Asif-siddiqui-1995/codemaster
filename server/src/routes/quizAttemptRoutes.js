const express = require("express");

const {
    saveQuizAttempt,
    getQuizHistory,
} = require("../controllers/quizAttemptController");

const router = express.Router();

router.post("/", saveQuizAttempt);
router.get("/", getQuizHistory);

module.exports = router;
