// src/controllers/student-controller.ts

import { Request, Response } from 'express';
import prisma from '../config/db';  // Prisma client import

export const addStudent = async (req: Request, res: Response) => {
    const { studentId, name, email, password } = req.body;
    try {
        // Using Prisma to add a new student record
        const student = await prisma.student.create({
            data: {
                studentId,
                name,
                email,
                password,
            },
        });

        res.status(201).json({ message: 'Student added successfully', student });
    } catch (error: unknown) {  // Specify the type of error here
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error adding student', error: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error' });
        }
    }
};
