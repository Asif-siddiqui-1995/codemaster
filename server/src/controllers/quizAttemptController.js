const QuizAttempt = require("../models/QuizAttempt");

// Save completed quiz
const saveQuizAttempt = async (req, res) => {
    try {
        const {
            curriculum,
            category,
            difficulty,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            durationSeconds,
        } = req.body || {};

        if (
            !curriculum ||
            !category ||
            !difficulty ||
            totalQuestions === undefined ||
            correctAnswers === undefined ||
            wrongAnswers === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required quiz details.",
            });
        }

        const total = Number(totalQuestions);
        const correct = Number(correctAnswers);
        const wrong = Number(wrongAnswers);
        const duration = Number(durationSeconds || 0);

        if (
            !["US", "India"].includes(curriculum) ||
            !["Beginner", "Intermediate", "Advanced"].includes(difficulty) ||
            !Number.isInteger(total) ||
            !Number.isInteger(correct) ||
            !Number.isInteger(wrong) ||
            !Number.isInteger(duration) ||
            total <= 0 ||
            correct < 0 ||
            wrong < 0 ||
            correct + wrong !== total ||
            duration < 0 ||
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz attempt details.",
            });
        }

        const percentage = Math.round((correct / total) * 100);

        const attempt = await QuizAttempt.create({
            curriculum,
            category: category.trim(),
            difficulty,
            totalQuestions: total,
            correctAnswers: correct,
            wrongAnswers: wrong,
            score: correct,
            percentage,
            durationSeconds: duration,
        });

        return res.status(201).json({
            success: true,
            message: "Quiz result saved successfully.",
            attempt,
        });
    } catch (error) {
        console.error("Save quiz attempt error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save quiz result.",
        });
    }
};

// Get quiz history
const getQuizHistory = async (req, res) => {
    try {
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 20, 1),
            100,
        );

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

        const skip = (page - 1) * limit;

        const [attempts, total] = await Promise.all([
            QuizAttempt.find()
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .lean(),

            QuizAttempt.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            count: attempts.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            attempts,
        });
    } catch (error) {
        console.error("Get quiz history error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch quiz history.",
        });
    }
};

module.exports = {
    saveQuizAttempt,
    getQuizHistory,
};
