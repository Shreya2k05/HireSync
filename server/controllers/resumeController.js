import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Resume } from '../models/index.js';
import { analyzeResume } from '../services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Multer Setup ──────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF and Word documents allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Extract text from PDF ─────────────────────────────────────────────────────
const extractText = async (filePath, originalName) => {
  try {
    const ext = path.extname(originalName).toLowerCase();
    if (ext === '.pdf') {
      const pdfParse = await import('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse.default(buffer);
      return data.text;
    }
    return 'Word document uploaded. Text extraction requires mammoth library.';
  } catch (err) {
    console.error('Text extraction error:', err.message);
    return 'Could not extract text from file.';
  }
};

// ── Upload Resume ─────────────────────────────────────────────────────────────
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const extractedText = await extractText(req.file.path, req.file.originalname);

    const resume = await Resume.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      extractedText,
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        _id: resume._id,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        createdAt: resume.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// ── Analyze Resume ────────────────────────────────────────────────────────────
export const analyzeResumeController = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription)
      return res.status(400).json({ message: 'resumeId and jobDescription are required' });

    if (jobDescription.trim().length < 50)
      return res.status(400).json({ message: 'Job description is too short' });

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const text = resume.extractedText || 'No text extracted from resume';
    const aiResult = await analyzeResume(text, jobDescription);

    const analysis = {
      jobDescription,
      atsScore: aiResult.atsScore || 0,
      matchedSkills: aiResult.matchedSkills || [],
      missingSkills: aiResult.missingSkills || [],
      suggestions: aiResult.suggestions || [],
      compatibilityPct: aiResult.compatibilityPct || 0,
      summary: aiResult.summary || '',
    };

    resume.analyses.push(analysis);
    resume.latestAtsScore = analysis.atsScore;
    await resume.save();

    const savedAnalysis = resume.analyses[resume.analyses.length - 1];

    res.json({
      message: 'Analysis complete',
      analysis: { ...analysis, _id: savedAnalysis._id },
    });
  } catch (err) { next(err); }
};

// ── Get All Resumes ───────────────────────────────────────────────────────────
export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (err) { next(err); }
};

// ── Get Single Resume ─────────────────────────────────────────────────────────
export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ resume });
  } catch (err) { next(err); }
};

// ── Delete Resume ─────────────────────────────────────────────────────────────
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    await resume.deleteOne();
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) { next(err); }
};