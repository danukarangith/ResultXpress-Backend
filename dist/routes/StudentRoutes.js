"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudentController_1 = require("../controllers/StudentController");
const router = express_1.default.Router();
// Route to get student results by student ID
router.get("/:studentId/results", StudentController_1.getStudentResults);
exports.default = router;
