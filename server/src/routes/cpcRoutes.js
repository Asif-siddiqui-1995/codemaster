const express = require("express");

const {
    getYears,
    getQuestionsByYear,
    getQuestionById,
    createQuestion,
    deleteYear,
} = require("../controllers/cpcController");

const router = express.Router();

router.get("/years", getYears);

router.get("/:year", getQuestionsByYear);

router.get("/question/:questionId", getQuestionById);

router.post("/", createQuestion);

router.delete("/:year", deleteYear);

module.exports = router;
