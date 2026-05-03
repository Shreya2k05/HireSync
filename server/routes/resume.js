import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  uploadResume,
  analyzeResumeController,
  getResumes,
  getResume,
  deleteResume,
  upload,
} from '../controllers/resumeController.js';

const router = express.Router();

router.use(protect);
router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/upload', upload.single('resume'), uploadResume);
router.post('/analyze', analyzeResumeController);
router.delete('/:id', deleteResume);

export default router;