import express from 'express';
import {getAllResults, getLatestResult} from '../controllers/ResultController';

const router = express.Router();

router.get('/:studentId/latest', getLatestResult);
router.get('/:studentId/all', getAllResults);

export default router;
