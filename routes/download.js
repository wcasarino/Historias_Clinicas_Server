import express from 'express';

import { downloadFile } from '../controllers/download.js';

const router = express.Router();

router.get('/:id/:idAtencion/:file/downloadFile', downloadFile);


export default router;