import { Request, Response } from 'express';
import prisma from '../config/db';
import { calculateGPA } from '../utils/gpa-utils';

export const getResult = async (req: Request, res: Response): Promise<void> => {
    const studentId = req.params.studentId; // Keep as a string

    if (!studentId || typeof studentId !== 'string') {
        res.status(400).json({ message: 'Invalid student ID' });
        return;
    }

    try {
        // Fetch results for the student from the database
        const results = await prisma.result.findMany({
            where: { studentId }, // Use string directly
        });

        // If no results are found, return a 404
        if (results.length === 0) {
            res.status(404).json({ message: 'Results not found' });
            return;
        }

        // Calculate GPA based on results
        const gpa = calculateGPA(results);

        // Return results and GPA
        res.status(200).json({ results, gpa });

    } catch (error: unknown) {
        console.error(error); // Log the error for debugging
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
