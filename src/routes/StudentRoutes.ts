
import { addStudent, editStudent, deleteStudent, getAllStudents } from '../controllers/StudentController';
import express from "express";

const router = express.Router();


router.post('/add', addStudent);

router.put('/edit/:studentId', editStudent);
router.delete('/delete/:studentId', deleteStudent);
router.get('/getStudents', getAllStudents);

export default router;
