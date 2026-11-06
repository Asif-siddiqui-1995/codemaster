const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const questionRoutes = require("./routes/questionRoutes");
const importRoutes = require("./routes/importRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const cpcRoutes = require("./routes/cpcRoutes");
const cpcImportRoutes = require("./routes/cpcImportRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/questions", questionRoutes);
app.use("/api/admin/questions", importRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);
app.use("/api/cpc", cpcRoutes);
app.use("/api/admin/cpc", cpcImportRoutes);

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "CodeMaster API is running",
    });
});

module.exports = app;
