import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import resumeRoutes from './routes/resume.js'
import interviewRoutes from './routes/interview.js'

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/interview', interviewRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 HireSync AI server running on port ${PORT}`)
})

export default app