import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  jobDescription: { type: String, required: true },
  atsScore: { type: Number, default: 0 },
  matchedSkills: [String],
  missingSkills: [String],
  suggestions: [String],
  compatibilityPct: { type: Number, default: 0 },
  summary: { type: String, default: '' },
  analyzedAt: { type: Date, default: Date.now },
});

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  extractedText: { type: String, default: '' },
  analyses: [analysisSchema],
  latestAtsScore: { type: Number, default: 0 },
}, { timestamps: true });

export const Resume = mongoose.model('Resume', resumeSchema);

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, enum: ['technical', 'behavioral', 'situational', 'domain'], default: 'technical' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  answer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  score: { type: Number, default: 0 },
  answeredAt: { type: Date },
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  jobDescription: { type: String, required: true },
  jobTitle: { type: String, default: 'Software Engineer' },
  questions: [questionSchema],
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  overallFeedback: {
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    summary: { type: String, default: '' },
  },
  completedAt: { type: Date },
  durationMinutes: { type: Number, default: 0 },
}, { timestamps: true });

export const Interview = mongoose.model('Interview', interviewSchema);