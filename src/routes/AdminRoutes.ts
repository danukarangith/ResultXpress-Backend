import express from 'express';
import {
    addAdmin,
    addResult, deleteAdmin,
    deleteResult, editAdmin,
    editResult,
    handleBulkUpload,
    uploadBulkResults
} from '../controllers/AdminController';


const router = express.Router();

router.post('/add-result', addResult);
router.put('/edit-result/:id', editResult);
router.delete('/delete-result/:id', deleteResult);
router.post('/upload-results', uploadBulkResults, handleBulkUpload);
router.post('/add-admin', addAdmin)
router.put('/edit-admin/:id', editAdmin)
router.delete('/delete-admin/:id', deleteAdmin)



export default router;
