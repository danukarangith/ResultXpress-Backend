import express from 'express';
import { getResult } from '../controllers/ResultController';

const router = express.Router();

router.get('/:studentId', getResult);

export default router;
