import { Request, Response } from 'express';
import prisma from '../config/db';
import { calculateGPA } from '../utils/gpa-utils';

export const getResult = async (req: Request, res: Response): Promise<void> => {
    const studentId = req.params.studentId; // Keep as a string

    if (!studentId) {
        res.status(400).json({ message: 'Student ID is required' });
        return;
    }

    try {
        const results = await prisma.result.findMany({
            where: { studentId }, // Use string directly
        });

        if (results.length === 0) {
            res.status(404).json({ message: 'Results not found' });
            return;
        }

        const gpa = calculateGPA(results);
        res.status(200).json({ results, gpa });

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
