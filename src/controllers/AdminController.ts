import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma types
import prisma from '../config/db';
import { uploadResults } from '../utils/excel-utils';
import multer from 'multer';
import router from "../routes/AdminRoutes";
import bcrypt from 'bcrypt';





// Define storage settings for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify folder where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Unique file name to avoid overwrite
    },
});

// Setup multer with storage settings
const upload = multer({ storage });

// Middleware for handling single file upload
export const uploadBulkResults = upload.single('file');

// Controller to handle the file upload and process the file
export const handleBulkUpload = async (req: Request, res: Response): Promise<void> => {  // ❌ Removed "Response" return type
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }

    const filePath = `uploads/${req.file.filename}`;

    try {
        await uploadResults(filePath);  // Function to process the uploaded Excel file
        res.status(200).json({ message: 'Results uploaded successfully' });  // ✅ Just send response
    } catch (error: unknown) {
        // Check if error is an instance of Error
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error uploading results', error: error.message });
            return;
        }
        // In case error is not of type Error
        res.status(500).json({ message: 'Unknown error occurred' });
    }
};

// Register the route
// router.post('/upload-results', uploadBulkResults, handleBulkUpload);




// Add a result
export const addResult = async (req: Request, res: Response): Promise<void> => {
    const { studentId, subject, marks, semester,date } = req.body;
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
        res.status(201).json({ message: 'Result added successfully', result });
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


    // Add an admin

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
