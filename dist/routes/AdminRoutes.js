"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminController_1 = require("../controllers/AdminController");
const router = express_1.default.Router();
// Routes for admin to add student and result
router.post("/students", AdminController_1.addStudent);
router.post("/results", AdminController_1.addResult);
exports.default = router;
