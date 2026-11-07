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
// Get daily and weekly progress
const getDailyProgress = async (req, res) => {
    try {
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(startOfToday);
        const day = (startOfWeek.getDay() + 6) % 7;
        startOfWeek.setDate(startOfWeek.getDate() - day);

        const attempts = await QuizAttempt.find({
            createdAt: {$gte: startOfWeek},
        }).lean();

        const todayAttempts = attempts.filter(
            (a) => new Date(a.createdAt) >= startOfToday,
        );

        const sum = (items, field) =>
            items.reduce((total, item) => total + item[field], 0);

        const weeklyActivity = Array.from({length: 7}, (_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + index);

            const dailyAttempts = attempts.filter((a) => {
                const created = new Date(a.createdAt);
                return created.toDateString() === date.toDateString();
            });

            return {
                day: date.toLocaleDateString("en-US", {weekday: "short"}),
                value: sum(dailyAttempts, "totalQuestions"),
            };
        });

        const totalQuestions = sum(attempts, "totalQuestions");
        const correctAnswers = sum(attempts, "correctAnswers");
        const todayCompleted = sum(todayAttempts, "totalQuestions");

        res.json({
            success: true,
            todayCompleted,
            dailyGoal: 10,
            totalQuestions,
            correctAnswers,
            accuracy: totalQuestions
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0,
            durationSeconds: sum(attempts, "durationSeconds"),
            weeklyActivity,
        });
    } catch (error) {
        console.error("Daily progress error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to fetch daily progress.",
        });
    }
};

module.exports = {
    saveQuizAttempt,
    getQuizHistory,
    getDailyProgress,
};
