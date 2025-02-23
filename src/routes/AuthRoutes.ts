import express from 'express';

import {login} from "../controllers/AuthController";
import { authMiddleware } from '../midleware/authMiddleware';


const router = express.Router();


router.post('/login', login);

router.get('/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'You have access to this protected route!' });
});



export default router;
