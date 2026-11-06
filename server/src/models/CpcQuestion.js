const mongoose = require("mongoose");

const cpcQuestionSchema = new mongoose.Schema(
    {
        year: {
            type: Number,
            required: true,
            index: true,
        },

        questionId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        topic: {
            type: String,
            required: true,
            trim: true,
        },

        question: {
            type: String,
            required: true,
            trim: true,
        },

        options: {
            A: {
                type: String,
                required: true,
            },
            B: {
                type: String,
                required: true,
            },
            C: {
                type: String,
                required: true,
            },
            D: {
                type: String,
                required: true,
            },
        },

        correctAnswer: {
            type: String,
            required: true,
            enum: ["A", "B", "C", "D"],
        },

        answerText: {
            type: String,
            required: true,
        },

        explanation: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("CpcQuestion", cpcQuestionSchema);
