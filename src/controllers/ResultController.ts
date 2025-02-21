// controllers/resultController.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { calculateGPA } from '../utils/gpa-utils';
import { getGradeFromMarks } from '../utils/grade-utils';
import PDFDocument from 'pdfkit';

export const getResult = async (req: Request, res: Response): Promise<void> => {
    const studentId = req.params.studentId;
    const isLatest = req.query.latest === 'true';

    if (!studentId || typeof studentId !== 'string') {
        res.status(400).json({ message: 'Invalid student ID' });
        return;
    }

    try {
        let results;

        if (isLatest) {
            // Fetch only the latest result based on date
            results = await prisma.result.findMany({
                where: { studentId },
                orderBy: { date: 'desc' },
                take: 1,
            });

            // Ensure there's only 1 result (this line might be redundant with `take: 1`)
            results = results.slice(0, 1);  // Just in case there are duplicates
        } else {
            // Fetch all results
            results = await prisma.result.findMany({
                where: { studentId },
                orderBy: { date: 'desc' }, // You might want to sort all results by date (optional)
            });
        }

        if (results.length === 0) {
            res.status(404).json({ message: 'Results not found' });
            return;
        }

        // Map results to include the calculated grade
        const resultsWithGrades = results.map(result => ({
            ...result,
            grade: getGradeFromMarks(result.marks),
        }));

        const gpa = calculateGPA(resultsWithGrades);

        if (req.query.report === 'pdf') {
            const doc = new PDFDocument();
            const fileName = `result-report-${studentId}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

            doc.pipe(res);

            doc.fontSize(18).text(`Student Result Report: ${studentId}`, { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`GPA: ${gpa}`, { align: 'left' });
            doc.moveDown();

            doc.text('Results:', { align: 'left' });
            resultsWithGrades.forEach((result) => {
                doc.text(`Subject: ${result.subject} | Marks: ${result.marks} | Grade: ${result.grade}`, { align: 'left' });
            });

            doc.end();
            return;
        }

        // Return only the first result if there are multiple (in case of "latest" logic)
        res.status(200).json({ result: resultsWithGrades[0], gpa });
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
