import { Request, Response } from 'express';
import prisma from '../config/db';
import { calculateGPA } from '../utils/gpa-utils';
import { getGradeFromMarks } from '../utils/grade-utils';
import PDFDocument from 'pdfkit';

export const getLatestResult = async (req: Request, res: Response): Promise<void> => {
    const studentId = req.params.studentId;

    if (!studentId || typeof studentId !== 'string') {
        res.status(400).json({ message: 'Invalid student ID' });
        return;
    }

    try {
        const result = await prisma.result.findFirst({
            where: { studentId },
            orderBy: { date: 'desc' },
        });

        if (!result) {
            res.status(404).json({ message: 'Result not found' });
            return;
        }

        const resultWithGrade = {
            ...result,
            grade: getGradeFromMarks(result.marks),
        };

        const gpa = calculateGPA([resultWithGrade]);

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
            doc.text(`Subject: ${resultWithGrade.subject} | Marks: ${resultWithGrade.marks} | Grade: ${resultWithGrade.grade}`, { align: 'left' });

            doc.end();
            return;
        }

        res.status(200).json({ result: resultWithGrade, gpa });
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

export const getAllResults = async (req: Request, res: Response): Promise<void> => {
    const studentId = req.params.studentId;

    if (!studentId || typeof studentId !== 'string') {
        res.status(400).json({ message: 'Invalid student ID' });
        return;
    }

    try {
        const results = await prisma.result.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
        });

        if (results.length === 0) {
            res.status(404).json({ message: 'Results not found' });
            return;
        }

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

        res.status(200).json({ results: resultsWithGrades, gpa });
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching results', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
