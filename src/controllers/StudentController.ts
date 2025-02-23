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
        const id = parseInt(req.params.id, 10);
        if (isNaN(id))  res.status(400).json({ message: "Invalid student ID" });

        const { name, email, password, adminId } = req.body;
        const student = await prisma.student.update({
            where: { id },
            data: { name, email, password, adminId },
        });

        res.status(200).json({ message: "Student updated successfully", student });
    } catch (error) {
        res.status(500).json({ message: "Error updating student", error: (error as Error).message });
    }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id))  res.status(400).json({ message: "Invalid student ID" });

        await prisma.student.delete({ where: { id } });

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
