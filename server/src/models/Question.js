const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        questionId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        curriculum: {
            type: String,
            required: true,
            enum: ["US", "India"],
        },

        codingSystem: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        difficulty: {
            type: String,
            required: true,
            enum: ["Beginner", "Intermediate", "Advanced"],
        },

        question: {
            type: String,
            required: true,
        },

        options: {
            A: {type: String, required: true},
            B: {type: String, required: true},
            C: {type: String, required: true},
            D: {type: String, required: true},
        },

        correctAnswer: {
            type: String,
            required: true,
            enum: ["A", "B", "C", "D"],
        },

        explanation: {
            type: String,
            default: "",
        },

        codingYear: {
            type: String,
            default: "",
        },

        sourceReference: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
    },
    {
        timestamps: true,
    },
);

questionSchema.index({
    curriculum: 1,
    category: 1,
    difficulty: 1,
    status: 1,
});

module.exports = mongoose.model("Question", questionSchema);
