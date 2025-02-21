

import prisma from "../config/db";

async function createStudent() {
    try {
        const newStudent = await prisma.student.create({
            data: {
                studentId: "STU12345",
                name: "John Doe",
                email: "johndoe@example.com",
                password: "hashedpassword",
                adminId: null, // Explicitly set adminId to null
            },
        });

        console.log("Student created:", newStudent);
    } catch (error) {
        console.error("Error creating student:", error);
    } finally {
        await prisma.$disconnect(); // Close DB connection
    }
}

// Call the function
createStudent();
