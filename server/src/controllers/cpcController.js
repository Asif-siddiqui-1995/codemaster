const CpcQuestion = require("../models/CpcQuestion");

// Get available previous-paper years
const getYears = async (req, res) => {
    try {
        const years = await CpcQuestion.aggregate([
            {
                $group: {
                    _id: "$year",
                    questions: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: -1,
                },
            },
        ]);

        res.json({
            success: true,
            data: years.map((item) => ({
                year: item._id,
                questions: item.questions,
            })),
        });
    } catch (error) {
        console.error("Get CPC years error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch CPC years",
        });
    }
};

// Get questions for a particular year
const getQuestionsByYear = async (req, res) => {
    try {
        const year = Number(req.params.year);

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "Valid year is required",
            });
        }

        const questions = await CpcQuestion.find({year})
            .select("_id year questionId topic question options")
            .sort({questionId: 1})
            .limit(25)
            .lean();

        res.json({
            success: true,
            year,
            totalQuestions: questions.length,
            data: questions,
        });
    } catch (error) {
        console.error("Get CPC questions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch CPC questions",
        });
    }
};

// Get a single question including answer
const getQuestionById = async (req, res) => {
    try {
        const question = await CpcQuestion.findOne({
            questionId: req.params.questionId,
        }).lean();

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        res.json({
            success: true,
            data: question,
        });
    } catch (error) {
        console.error("Get CPC question error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch question",
        });
    }
};

// Add one question
const createQuestion = async (req, res) => {
    try {
        const question = await CpcQuestion.create(req.body);

        res.status(201).json({
            success: true,
            message: "CPC question created successfully",
            data: question,
        });
    } catch (error) {
        console.error("Create CPC question error:", error);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete all questions for a year
const deleteYear = async (req, res) => {
    try {
        const year = Number(req.params.year);

        const result = await CpcQuestion.deleteMany({year});

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} questions`,
        });
    } catch (error) {
        console.error("Delete CPC year error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete questions",
        });
    }
};

module.exports = {
    getYears,
    getQuestionsByYear,
    getQuestionById,
    createQuestion,
    deleteYear,
};
