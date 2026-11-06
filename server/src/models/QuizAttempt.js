const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
    {
        curriculum: {
            type: String,
            enum: ["US", "India"],
            required: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            required: true,
        },

        totalQuestions: {
            type: Number,
            required: true,
            min: 0,
        },

        correctAnswers: {
            type: Number,
            required: true,
            min: 0,
        },

        wrongAnswers: {
            type: Number,
            required: true,
            min: 0,
        },

        score: {
            type: Number,
            required: true,
            min: 0,
        },

        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },

        durationSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    },
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
