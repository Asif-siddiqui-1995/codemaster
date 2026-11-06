const Question = require("../models/Question");

// Get questions for the quiz

// Get questions for Practice or Daily Challenge
exports.getQuestions = async (req, res) => {
    try {
        const {mode, curriculum, category, difficulty, limit = 10} = req.query;

        const allowedCurricula = ["US", "India"];
        const allowedDifficulties = ["Beginner", "Intermediate", "Advanced"];

        const isDailyChallenge = mode === "daily";

        const questionLimit = isDailyChallenge
            ? 5
            : Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

        let match = {
            status: "published",
        };

        // Normal Practice filters
        if (!isDailyChallenge) {
            if (!curriculum || !category || !difficulty) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Curriculum, category and difficulty are required.",
                });
            }

            if (!allowedCurricula.includes(curriculum)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid curriculum.",
                });
            }

            if (!allowedDifficulties.includes(difficulty)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid difficulty.",
                });
            }

            match = {
                ...match,
                curriculum,
                category,
                difficulty,
            };
        }

        const questions = await Question.aggregate([
            {
                $match: match,
            },
            {
                $sample: {
                    size: questionLimit,
                },
            },
            {
                $project: {
                    _id: 1,
                    questionId: 1,
                    curriculum: 1,
                    codingSystem: 1,
                    category: 1,
                    difficulty: 1,
                    question: 1,
                    options: 1,
                    explanation: 1,
                    codingYear: 1,
                    sourceReference: 1,
                },
            },
        ]);

        return res.json({
            success: true,
            mode: isDailyChallenge ? "daily" : "practice",
            count: questions.length,
            questions,
        });
    } catch (error) {
        console.error("Get questions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve questions.",
        });
    }
};

// Check an answer after the user submits it
exports.submitAnswer = async (req, res) => {
    try {
        const {questionId, answer} = req.body;

        if (!questionId || !["A", "B", "C", "D"].includes(answer)) {
            return res.status(400).json({
                success: false,
                message: "Valid question ID and answer are required.",
            });
        }

        const question = await Question.findOne({
            questionId,
            status: "published",
        }).select("+correctAnswer");

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found.",
            });
        }

        const isCorrect = question.correctAnswer === answer;

        return res.json({
            success: true,
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
        });
    } catch (error) {
        console.error("Submit answer error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to check answer.",
        });
    }
};
