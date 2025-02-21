"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
async function createStudent() {
    try {
        const newStudent = await db_1.default.student.create({
            data: {
                studentId: "STU12345",
                name: "John Doe",
                email: "johndoe@example.com",
                password: "hashedpassword",
                adminId: null, // Explicitly set adminId to null
            },
        });
        console.log("Student created:", newStudent);
    }
    catch (error) {
        console.error("Error creating student:", error);
    }
    finally {
        await db_1.default.$disconnect(); // Close DB connection
    }
}
// Call the function
createStudent();
