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
            const doc = new PDFDocument({
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                size: 'A4'
            });
            const fileName = `result-report-${studentId}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

            doc.pipe(res);

            // Add a border to the entire page
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                .lineWidth(1)
                .stroke('#1E3A8A');

            // Add header with school logo placeholder
            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('IJSE ACADEMIC TRANSCRIPT', 50, 40, { align: 'right' });

            // Document title with styling
            const titleY = 80;
            doc.fontSize(24)
                .fillColor('#1E3A8A')
                .font('Helvetica-Bold')
                .text(`Student Result Report`, 50, titleY, { align: 'center' });

            doc.fontSize(16)
                .fillColor('#4B5563')
                .text(`ID: ${studentId}`, 50, titleY + 30, { align: 'center' });

            // Add a horizontal line
            const lineY = titleY + 70;
            doc.moveTo(50, lineY)
                .lineTo(doc.page.width - 50, lineY)
                .stroke('#CBD5E1');

            // GPA section with highlight box
            const gpaBoxY = lineY + 20;
            doc.rect(50, gpaBoxY, 150, 50)
                .fillAndStroke('#F0F9FF', '#93C5FD');

            doc.fontSize(14)
                .fillColor('#1E40AF')
                .text('CURRENT GPA', 75, gpaBoxY + 10);

            doc.fontSize(22)
                .fillColor('#1E3A8A')
                .font('Helvetica-Bold')
                .text(`${gpa}`, 100, gpaBoxY + 30);

            // Results table header
            const resultsY = gpaBoxY + 90;
            doc.fontSize(16)
                .fillColor('#1E3A8A')
                .font('Helvetica-Bold')
                .text('Academic Results', 50, resultsY);

            // Create a table-like structure for results
            const tableTop = resultsY + 30;
            const tableWidth = doc.page.width - 100;

            // Table header
            doc.rect(50, tableTop, tableWidth, 30)
                .fillAndStroke('#1E3A8A', '#1E3A8A');

            doc.fillColor('#FFFFFF')
                .fontSize(12)
                .text('Subject', 70, tableTop + 10)
                .text('Marks', 250, tableTop + 10)
                .text('Grade', 400, tableTop + 10);

            // Table row
            doc.rect(50, tableTop + 30, tableWidth, 30)
                .fillAndStroke('#F9FAFB', '#E5E7EB');

            doc.fillColor('#374151')
                .fontSize(12)
                .text(resultWithGrade.subject, 70, tableTop + 40)
                .text(resultWithGrade.marks.toString(), 250, tableTop + 40)
                .text(resultWithGrade.grade, 400, tableTop + 40);

            // Footer
            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('This document is electronically generated and requires no signature.',
                    50, doc.page.height - 50, { align: 'center' });

            doc.fontSize(8)
                .text(`Generated on: ${new Date().toLocaleDateString()}`,
                    50, doc.page.height - 30, { align: 'center' });

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
            const doc = new PDFDocument({
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                size: 'A4'
            });
            const fileName = `result-report-${studentId}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

            doc.pipe(res);

            // Add a border to the entire page
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                .lineWidth(1)
                .stroke('#1E3A8A');

            // Add header with school logo placeholder
            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('IJSE ACADEMIC TRANSCRIPT', 50, 40, { align: 'right' });

            // Document title with styling
            const titleY = 80;
            doc.fontSize(24)
                .fillColor('#1E3A8A')
                .font('Helvetica-Bold')
                .text(`Student Result Report`, 50, titleY, { align: 'center' });

            doc.fontSize(16)
                .fillColor('#4B5563')
                .text(`ID: ${studentId}`, 50, titleY + 30, { align: 'center' });

            // Add a horizontal line
            const lineY = titleY + 70;
            doc.moveTo(50, lineY)
                .lineTo(doc.page.width - 50, lineY)
                .stroke('#CBD5E1');

            // GPA section with highlight box
            const gpaBoxY = lineY + 20;
            doc.rect(50, gpaBoxY, 150, 50)
                .fillAndStroke('#F0F9FF', '#93C5FD');

            doc.fontSize(14)
                .fillColor('#1E40AF')
                .text('CURRENT GPA', 75, gpaBoxY + 10);

            doc.fontSize(22)
                .fillColor('#1E3A8A')
                .font('Helvetica-Bold')
                .text(`${gpa}`, 100, gpaBoxY + 30);

            // Results table header
            const resultsY = gpaBoxY + 90;
            doc.fontSize(16)
                .fillColor('#1E3A8A')
                .font('Helvetica-Bold')
                .text('Academic Results', 50, resultsY);

            const tableTop = resultsY + 30;
            const tableWidth = doc.page.width - 100;

// Table header
            doc.rect(50, tableTop, tableWidth, 30)
                .fillAndStroke('#1E3A8A', '#1E3A8A');

            doc.fillColor('#FFFFFF')
                .fontSize(12)
                .text('Subject', 70, tableTop + 10)
                .text('Marks', 250, tableTop + 10)
                .text('Grade', 400, tableTop + 10);

// Loop through resultsWithGrades and add rows
            resultsWithGrades.forEach((result, index) => {
                const rowY = tableTop + 30 + (index * 30); // Adjust for each row's vertical position

                doc.rect(50, rowY, tableWidth, 30)
                    .fillAndStroke(index % 2 === 0 ? '#F9FAFB' : '#E5E7EB', index % 2 === 0 ? '#E5E7EB' : '#F9FAFB');

                doc.fillColor('#374151')
                    .fontSize(12)
                    .text(result.subject, 70, rowY + 10)
                    .text(result.marks.toString(), 250, rowY + 10)
                    .text(result.grade, 400, rowY + 10);
            });

            // Footer
            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('This document is electronically generated and requires no signature.',
                    50, doc.page.height - 50, { align: 'center' });

            doc.fontSize(8)
                .text(`Generated on: ${new Date().toLocaleDateString()}`,
                    50, doc.page.height - 30, { align: 'center' });

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
