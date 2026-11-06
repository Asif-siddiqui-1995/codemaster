const crypto = require("crypto");

module.exports = (req, res, next) => {
    const expectedKey = process.env.QUESTION_IMPORT_KEY;
    const suppliedKey = req.headers["x-import-key"];

    if (!expectedKey) {
        return res.status(500).json({
            success: false,
            message: "Question import key is not configured.",
        });
    }

    if (typeof suppliedKey !== "string") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized import request.",
        });
    }

    const expected = Buffer.from(expectedKey);
    const supplied = Buffer.from(suppliedKey);

    if (
        expected.length !== supplied.length ||
        !crypto.timingSafeEqual(expected, supplied)
    ) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized import request.",
        });
    }

    next();
};
