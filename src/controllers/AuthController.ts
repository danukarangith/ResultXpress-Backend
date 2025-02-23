import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import { Request, Response } from 'express';

// Define types for Admin and Student for clarity
type Admin = {
    id: number;
    email: string;
    password: string;
    username: string;
};

type Student = {
    id: number;
    email: string;
    password: string;
    studentId: string;
    adminId: number | null;
};

// Type that handles both Admin and Student
type User = Admin | Student;

const generateToken = (user: User): string => {
    if ('username' in user) {
        return jwt.sign(
            { id: user.id, email: user.email, role: 'ADMIN', username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
    }

    return jwt.sign(
        { id: user.id, email: user.email, role: 'STUDENT' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    );
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    console.log(email)

    try {
        let user: Admin | Student | null = await prisma.admin.findUnique({ where: { email } });
        // console.log(user)

        if (!user) {
            user = await prisma.student.findUnique({ where: { email } });
        }

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return; // Ensure function stops here
        }
    console.log("hello")
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid password' });
            return; // Ensure function stops here
        }

        const token = generateToken(user);
        res.json({ token });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
