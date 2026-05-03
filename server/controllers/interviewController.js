import { Interview } from '../models/index.js'
import { Resume } from '../models/index.js'
import { generateInterviewQuestions, evaluateAnswer, generateOverallFeedback } from '../services/geminiService.js'

// ── Generate Interview ────────────────────────────────────────────────────────
export const generateInterview = async (req, res, next) => {
  try {
    const { jobDescription, resumeId, jobTitle } = req.body

    if (!jobDescription || jobDescription.trim().length < 30)
      return res.status(400).json({ message: 'Please provide a valid job description' })

    // Get resume text if resumeId provided
    let resumeText = 'General software engineering candidate'
    let missingSkills = []

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id })
      if (resume) {
        resumeText = resume.extractedText || resumeText
        // Get missing skills from latest analysis
        if (resume.analyses?.length > 0) {
          const latest = resume.analyses[resume.analyses.length - 1]
          missingSkills = latest.missingSkills || []
        }
      }
    }

    // Generate questions with Gemini
    const questions = await generateInterviewQuestions(resumeText, jobDescription, missingSkills)

    // Create interview in DB
    const interview = await Interview.create({
      user: req.user._id,
      resume: resumeId || null,
      jobDescription: jobDescription.trim(),
      jobTitle: jobTitle || 'Software Engineer',
      questions: questions.map(q => ({
        question: q.question,
        category: q.category || 'technical',
        difficulty: q.difficulty || 'medium',
      })),
      status: 'in-progress',
    })

    res.status(201).json({
      message: 'Interview generated successfully',
      interview: {
        _id: interview._id,
        jobTitle: interview.jobTitle,
        jobDescription: interview.jobDescription,
        questions: interview.questions.map(q => ({
          _id: q._id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
        })),
        status: interview.status,
        createdAt: interview.createdAt,
      }
    })
  } catch (err) { next(err) }
}

// ── Submit Answer ─────────────────────────────────────────────────────────────
export const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body
    const { id: interviewId } = req.params

    if (!answer || answer.trim().length < 5)
      return res.status(400).json({ message: 'Please provide a valid answer' })

    const interview = await Interview.findOne({ _id: interviewId, user: req.user._id })
    if (!interview) return res.status(404).json({ message: 'Interview not found' })
    if (interview.status === 'completed')
      return res.status(400).json({ message: 'Interview already completed' })

    const question = interview.questions.id(questionId)
    if (!question) return res.status(404).json({ message: 'Question not found' })

    // Evaluate with Gemini
    const evaluation = await evaluateAnswer(
      question.question,
      answer.trim(),
      interview.jobDescription
    )

    // Update question
    question.answer = answer.trim()
    question.feedback = evaluation.feedback
    question.score = evaluation.score
    question.answeredAt = new Date()

    await interview.save()

    res.json({
      message: 'Answer submitted',
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
      }
    })
  } catch (err) { next(err) }
}

// ── Complete Interview ────────────────────────────────────────────────────────
export const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    if (!interview) return res.status(404).json({ message: 'Interview not found' })

    // Generate overall feedback
    const feedback = await generateOverallFeedback(
      interview.questions,
      interview.jobDescription
    )

    interview.status = 'completed'
    interview.completedAt = new Date()
    interview.overallFeedback = {
      technicalScore: feedback.technicalScore || 0,
      communicationScore: feedback.communicationScore || 0,
      overallScore: feedback.overallScore || 0,
      strengths: feedback.strengths || [],
      weaknesses: feedback.weaknesses || [],
      suggestions: feedback.suggestions || [],
      summary: feedback.summary || '',
    }

    // Calculate duration in minutes
    const start = new Date(interview.createdAt)
    const end = new Date()
    interview.durationMinutes = Math.round((end - start) / 60000)

    // Update user stats
    const { User } = await import('../models/User.js')
    const user = await User.findById(req.user._id)
    if (user) {
      const prevTotal = user.totalInterviews || 0
      const prevAvg = user.avgScore || 0
      user.totalInterviews = prevTotal + 1
      user.avgScore = Math.round((prevAvg * prevTotal + feedback.overallScore) / (prevTotal + 1))
      await user.save()
    }

    await interview.save()

    res.json({
      message: 'Interview completed',
      feedback: interview.overallFeedback,
      durationMinutes: interview.durationMinutes,
    })
  } catch (err) { next(err) }
}

// ── Get Interview History ─────────────────────────────────────────────────────
export const getHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .select('-questions.answer -questions.feedback')
      .sort({ createdAt: -1 })
      .limit(20)
    res.json({ interviews })
  } catch (err) { next(err) }
}

// ── Get Single Interview ──────────────────────────────────────────────────────
export const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    if (!interview) return res.status(404).json({ message: 'Interview not found' })
    res.json({ interview })
  } catch (err) { next(err) }
}