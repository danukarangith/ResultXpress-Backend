"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addResult = exports.addStudent = void 0;
const db_1 = __importDefault(require("../config/db"));
// Admin adds a new student
const addStudent = async (req, res) => {
    const { studentId, name, email, password } = req.body;
    try {
        const newStudent = await db_1.default.student.create({
            data: { studentId, name, email, password },
        });
        res.status(201).json(newStudent);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding student" });
    }
};
exports.addStudent = addStudent;
// Admin adds result for a student
const addResult = async (req, res) => {
    const { studentId, subject, marks, semester } = req.body;
    try {
        const result = await db_1.default.result.create({
            data: { studentId, subject, marks, semester },
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding result" });
    }
};
exports.addResult = addResult;
