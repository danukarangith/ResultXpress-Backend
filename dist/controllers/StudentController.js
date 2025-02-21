"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentResults = void 0;
const db_1 = __importDefault(require("../config/db"));
// Function to get student results by student ID
const getStudentResults = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const results = await db_1.default.result.findMany({
            where: { studentId },
            include: { student: true }, // Includes student info
        });
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching results" });
    }
};
exports.getStudentResults = getStudentResults;
