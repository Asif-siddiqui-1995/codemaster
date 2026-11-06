const csv = require("csv-parser");
const {Readable} = require("stream");
const Question = require("../models/Question");

const REQUIRED_HEADERS = [
    "questionId",
    "curriculum",
    "codingSystem",
    "category",
    "difficulty",
    "question",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "correctAnswer",
];

const ALLOWED_CURRICULA = ["US", "India"];

const ALLOWED_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const ALLOWED_ANSWERS = ["A", "B", "C", "D"];

const ALLOWED_STATUSES = ["draft", "published"];

function parseCSV(buffer) {
    return new Promise((resolve, reject) => {
        const rows = [];

        Readable.from([buffer])
            .pipe(
                csv({
                    mapHeaders: ({header}) =>
                        header.trim().replace(/^\uFEFF/, ""),
                }),
            )
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
}

function validateRow(row) {
    const errors = [];

    const requiredFields = [
        "questionId",
        "curriculum",
        "codingSystem",
        "category",
        "difficulty",
        "question",
        "optionA",
        "optionB",
        "optionC",
        "optionD",
        "correctAnswer",
    ];

    for (const field of requiredFields) {
        if (!String(row[field] || "").trim()) {
            errors.push(`${field} is required`);
        }
    }

    const curriculum = String(row.curriculum || "").trim();
    const difficulty = String(row.difficulty || "").trim();
    const correctAnswer = String(row.correctAnswer || "")
        .trim()
        .toUpperCase();

    const status = String(row.status || "draft")
        .trim()
        .toLowerCase();

    if (!ALLOWED_CURRICULA.includes(curriculum)) {
        errors.push("curriculum must be US or India");
    }

    if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
        errors.push("Invalid difficulty");
    }

    if (!ALLOWED_ANSWERS.includes(correctAnswer)) {
        errors.push("correctAnswer must be A, B, C or D");
    }

    if (!ALLOWED_STATUSES.includes(status)) {
        errors.push("status must be draft or published");
    }

    if (errors.length) {
        return {errors};
    }

    return {
        errors: [],
        data: {
            questionId: row.questionId.trim(),
            curriculum,
            codingSystem: row.codingSystem.trim(),
            category: row.category.trim(),
            difficulty,
            question: row.question.trim(),

            options: {
                A: row.optionA.trim(),
                B: row.optionB.trim(),
                C: row.optionC.trim(),
                D: row.optionD.trim(),
            },

            correctAnswer,
            explanation: String(row.explanation || "").trim(),
            codingYear: String(row.codingYear || "").trim(),
            sourceReference: String(row.sourceReference || "").trim(),
            status,
        },
    };
}

exports.importQuestionsFromCSV = async (buffer) => {
    const rows = await parseCSV(buffer);

    if (!rows.length) {
        throw new Error("The CSV file contains no question rows.");
    }

    if (rows.length > 1000) {
        throw new Error("Maximum 1000 questions per upload.");
    }

    const headers = Object.keys(rows[0]);

    const missingHeaders = REQUIRED_HEADERS.filter(
        (header) => !headers.includes(header),
    );

    if (missingHeaders.length) {
        throw new Error(`Missing CSV columns: ${missingHeaders.join(", ")}`);
    }

    const report = {
        totalRows: rows.length,
        imported: 0,
        skipped: 0,
        errors: [],
    };

    const seenIds = new Set();

    const validQuestions = [];

    for (let index = 0; index < rows.length; index++) {
        const rowNumber = index + 2;
        const result = validateRow(rows[index]);

        if (result.errors.length) {
            report.skipped++;

            report.errors.push({
                row: rowNumber,
                questionId: rows[index].questionId || "",
                errors: result.errors,
            });

            continue;
        }

        const question = result.data;

        if (seenIds.has(question.questionId)) {
            report.skipped++;

            report.errors.push({
                row: rowNumber,
                questionId: question.questionId,
                errors: ["Duplicate questionId in CSV file"],
            });

            continue;
        }

        seenIds.add(question.questionId);
        validQuestions.push({row: rowNumber, data: question});
    }

    const existingIds = await Question.find({
        questionId: {
            $in: validQuestions.map((item) => item.data.questionId),
        },
    }).distinct("questionId");

    const existingIdSet = new Set(existingIds);

    for (const item of validQuestions) {
        const {row, data} = item;

        if (existingIdSet.has(data.questionId)) {
            report.skipped++;

            report.errors.push({
                row,
                questionId: data.questionId,
                errors: ["This questionId already exists in MongoDB"],
            });

            continue;
        }

        try {
            await Question.create(data);
            report.imported++;
        } catch (error) {
            report.skipped++;

            report.errors.push({
                row,
                questionId: data.questionId,
                errors: [error.message],
            });
        }
    }

    return report;
};
