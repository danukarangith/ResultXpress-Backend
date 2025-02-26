import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

// Add Student
export const addStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, name, email, password, adminId } = req.body;

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const student = await prisma.student.create({
            data: { studentId, name, email, password: hashedPassword, adminId },
        });

        res.status(201).json({ message: 'Student added successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Error adding student', error: (error as Error).message });
    }
};

// Edit Student
export const editStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params; // Get studentId from URL params
        if (!studentId) {
             res.status(400).json({ message: "Student ID is required" }); // Ensure return here
        }

        const { name, email, password, adminId } = req.body;

        // If password is provided, hash it before saving
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            // Proceed with updating the student with the hashed password
            const student = await prisma.student.update({
                where: { studentId }, // Use studentId for the unique constraint
                data: { name, email, password: hashedPassword, adminId },
            });

             res.status(200).json({ message: "Student updated successfully", student }); // Ensure return here
        } else {
            // Update without password if not provided
            const student = await prisma.student.update({
                where: { studentId }, // Use studentId for the unique constraint
                data: { name, email, adminId },
            });

             res.status(200).json({ message: "Student updated successfully", student }); // Ensure return here
        }
    } catch (error) {
         res.status(500).json({ message: "Error updating student", error: (error as Error).message }); // Ensure return here
    }
};


// Delete Student
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params; // Get studentId from URL params
        if (!studentId) {
             res.status(400).json({ message: "Student ID is required" });
        }

        // Delete student using studentId
        await prisma.student.delete({
            where: { studentId }, // Use studentId for deletion
        });

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting student", error: (error as Error).message });
    }
};


// Get All Students
export const getAllStudents = async (_req: Request, res: Response): Promise<void> => {
    try {
        const students = await prisma.student.findMany();
         res.status(200).json(students);
    } catch (error) {
         res.status(500).json({ message: 'Error retrieving students', error: (error as Error).message });
    }
};
