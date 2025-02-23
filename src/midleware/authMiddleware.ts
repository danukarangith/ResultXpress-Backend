import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Unauthorized, no token provided' });
        return;  // Ensure function exits
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { role: string };
        req.body.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;  // Ensure function exits
    }
};
