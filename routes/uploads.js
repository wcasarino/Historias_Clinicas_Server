import express from 'express';
import { UpdateSelectedFilesAtencion } from '../controllers/upload.js'

const router = express.Router();
import upload from '../middleware/upload.js'

router.post('/:id/UpdateSelectedFilesAtencion', upload, UpdateSelectedFilesAtencion);

export default router;
