import express from 'express';
import {addResult, deleteResult, editResult, handleBulkUpload, uploadBulkResults} from '../controllers/AdminController';


const router = express.Router();

router.post('/add-result', addResult);
router.put('/edit-result/:id', editResult);
router.delete('/delete-result/:id', deleteResult);
router.post('/upload-results', uploadBulkResults, handleBulkUpload);

export default router;
