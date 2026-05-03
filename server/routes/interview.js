import express from 'express'
import { protect } from '../middleware/auth.js'
import { generateInterview, submitAnswer, completeInterview, getHistory, getInterview } from '../controllers/interviewController.js'

const router = express.Router()
router.use(protect)
router.post('/generate', generateInterview)
router.get('/history', getHistory)
router.get('/:id', getInterview)
router.post('/:id/answer', submitAnswer)
router.post('/:id/complete', completeInterview)

export default router