import express from 'express';
import { addStudent } from '../controllers/StudentController';

const router = express.Router();

router.post('/add', addStudent);

export default router;
