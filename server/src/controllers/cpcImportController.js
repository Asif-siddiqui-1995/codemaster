const fs = require("fs");
const csv = require("csv-parser");
const CpcQuestion = require("../models/CpcQuestion");

const uploadCpcCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "CSV file is required",
        });
    }

    const questions = [];

    try {
        fs.createReadStream(req.file.path)
            .pipe(
                csv({
                    mapHeaders: ({header}) =>
                        header.trim().replace(/^\uFEFF/, ""),
                }),
            )
            .on("headers", (headers) => {
                console.log("CSV HEADERS:");
                console.log(headers);
            })
            .on("data", (row) => {
                console.log("CSV ROW:", row);

                if (!row.year || !row.question) {
                    return;
                }

                questions.push({
                    year: Number(row.year),

                    questionId: row.question_id,

                    topic: row.topic,

                    question: row.question,

                    options: {
                        A: row.option_a,
                        B: row.option_b,
                        C: row.option_c,
                        D: row.option_d,
                    },

                    correctAnswer: row.correct_answer,

                    answerText: row.answer_text,
                });
            })
            .on("end", async () => {
                try {
                    console.log(`Total valid questions: ${questions.length}`);

                    if (questions.length === 0) {
                        if (fs.existsSync(req.file.path)) {
                            fs.unlinkSync(req.file.path);
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                "CSV was read but no valid questions were found",
                            expectedHeaders: [
                                "year",
                                "question_id",
                                "topic",
                                "question",
                                "option_a",
                                "option_b",
                                "option_c",
                                "option_d",
                                "correct_answer",
                                "answer_text",
                            ],
                        });
                    }

                    const result = await CpcQuestion.insertMany(questions, {
                        ordered: false,
                    });

                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(201).json({
                        success: true,
                        message: "CPC questions imported successfully",
                        imported: result.length,
                    });
                } catch (error) {
                    console.error("MongoDB import error:", error);

                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(500).json({
                        success: false,
                        message: "Failed to save questions",
                        error: error.message,
                    });
                }
            })
            .on("error", (error) => {
                console.error("CSV parsing error:", error);

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    success: false,
                    message: "Failed to parse CSV",
                    error: error.message,
                });
            });
    } catch (error) {
        console.error("Upload error:", error);

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "CSV upload failed",
            error: error.message,
        });
    }
};

module.exports = {
    uploadCpcCsv,
};
