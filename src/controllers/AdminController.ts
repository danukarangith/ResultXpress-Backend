import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma types
import prisma from '../config/db';
import { uploadResults } from '../utils/excel-utils';
import multer from 'multer';
import router from "../routes/AdminRoutes";
import bcrypt from 'bcrypt';
import { sendEmail as sendEmailService } from "../utils/emailService";


import nodemailer from "nodemailer";





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});


const upload = multer({ storage });


export const uploadBulkResults = upload.single('file');


const sendEmail = async (recipient: string, filePath: string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Use your Gmail
            pass: process.env.EMAIL_APP_PASSWORD, // Use an App Password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'Results Upload Successful',
        text: `The results file has been successfully uploaded and processed.\n\nFile Path: ${filePath}`,
    };

    await transporter.sendMail(mailOptions);
};


export const handleBulkUpload = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }

    const filePath = `uploads/${req.file.filename}`;

    try {
        // Process the Excel file and extract student data
        const uploadedResults = await uploadResults(filePath);

        console.log("✅ File uploaded successfully, sending emails...");

        // Get all student emails from database
        const students = await prisma.student.findMany({
            select: { email: true },
        });
        const studentEmails = students.map(student => student.email);

        if (studentEmails.length > 0) {
            // Send email notifications to all students
            const emailSubject = "📢 New Exam Results Available!";
            const emailText = `Dear Students,\n\nNew results have been uploaded. Check your student portal for details.\n\nBest regards,\nAdmin`;

            await sendEmailService(studentEmails, emailSubject, emailText);
            console.log("📩 Bulk email sent successfully!");
        } else {
            console.log("⚠️ No students found to send emails.");
        }

        res.status(200).json({ message: 'Results uploaded successfully, and emails sent.' });

    } catch (error: unknown) {
        console.error("❌ Error in handleBulkUpload:", error);

        if (error instanceof Error) {
            res.status(500).json({ message: 'Error uploading results', error: error.message });
            return;
        }
        res.status(500).json({ message: 'Unknown error occurred' });
    }
};






export const addResult = async (req: Request, res: Response): Promise<void> => {
    const { studentId, subject, marks, semester, date } = req.body;

    try {

        const result = await prisma.result.create({
            data: {
                studentId,
                subject,
                marks,
                semester,
                date
            },
        });


        const students = await prisma.student.findMany({
            select: { email: true },
        });

        const studentEmails = students.map(student => student.email);


        const emailSubject = "📢 New Exam Results Available!";
        const emailText = `Dear Students,\n\nNew results for ${subject} (Semester: ${semester}) have been updated.\n\nCheck your student portal for details.\n\nBest regards,\nAdmin`;

        await sendEmailService(studentEmails, emailSubject, emailText);


        res.status(201).json({ message: 'Result added successfully and emails sent!', result });

    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(500).json({ message: 'Prisma error', errorCode: error.code });
        } else if (error instanceof Error) {
            res.status(500).json({ message: 'Error adding result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};


// Edit a result
export const editResult = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { studentId, subject, marks, semester } = req.body;
    try {
        const result = await prisma.result.update({
            where: { id: Number(id) },
            data: {
                studentId,
                subject,
                marks,
                semester,
            },
        });

        res.status(200).json({ message: 'Result updated successfully', result });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.status(404).json({ message: 'Result not found' });
        } else if (error instanceof Error) {
            res.status(500).json({ message: 'Error updating result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
// Get all results
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await prisma.result.findMany();

        res.status(200).json({ message: 'Results fetched successfully', results });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching results', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};


// Delete a result
export const deleteResult = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await prisma.result.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Result deleted successfully', result });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.status(404).json({ message: 'Result not found' });
        } else if (error instanceof Error) {
            res.status(500).json({ message: 'Error deleting result', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }




};
export const addAdmin = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.admin.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'Admin added successfully', admin });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(500).json({ message: 'Prisma error', errorCode: error.code });
        } else if (error instanceof Error) {
            res.status(500).json({ message: 'Error adding admin', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

// Edit an admin
export const editAdmin = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const admin = await prisma.admin.update({
            where: { id: Number(id) },
            data: {
                username,
                email,
                ...(hashedPassword && { password: hashedPassword }),
            },
        });
        res.status(200).json({ message: 'Admin updated successfully', admin });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.status(404).json({ message: 'Admin not found' });
        } else if (error instanceof Error) {
            res.status(500).json({ message: 'Error updating admin', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

// Delete an admin
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const admin = await prisma.admin.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Admin deleted successfully', admin });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.status(404).json({ message: 'Admin not found' });
        } else if (error instanceof Error) {
            res.status(500).json({ message: 'Error deleting admin', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
// Get all admins
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await prisma.admin.findMany(); // Fetch all admins
        res.status(200).json({ message: 'Admins retrieved successfully', admins });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving admins', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};



// // Upload bulk results (from an Excel file)
// export const uploadBulkResults = async (req: Request, res: Response): Promise<void> => {
//     const { filePath } = req.body;
//     try {
//         await uploadResults(filePath);
//         res.status(200).json({ message: 'Results uploaded successfully' });
//     } catch (error: unknown) {
//         if (error instanceof Error) {
//             res.status(500).json({ message: 'Error uploading results', error: error.message });
//         } else {
//             res.status(500).json({ message: 'An unknown error occurred' });
//         }
//     }
// };
