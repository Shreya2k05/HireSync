import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
const getModel = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
};

const getJsonFromResponse = (text) => {
  try {
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error('Error parsing JSON from Gemini response:', err);
    throw new Error('Failed to parse AI response');
  }
};

export const analyzeResume = async (resumeText, jobDescription) => {
  const model = getModel();
  
  const prompt = `
  You are an expert ATS (Applicant Tracking System) and technical recruiter. 
  Please analyze the following resume against the provided job description.
  
  Job Description:
  ${jobDescription}
  
  Resume:
  ${resumeText}
  
  Provide your analysis in strictly JSON format matching the following structure:
  {
    "atsScore": (number between 0-100),
    "compatibilityPct": (number between 0-100),
    "matchedSkills": (array of strings, e.g., ["React", "Node.js"]),
    "missingSkills": (array of strings),
    "suggestions": (array of 3-5 strings with actionable advice to improve the resume for this job),
    "summary": (A short paragraph summarizing the candidate's fit)
  }
  `;

  const result = await model.generateContent(prompt);
  return getJsonFromResponse(result.response.text());
};

export const generateInterviewQuestions = async (resumeText, jobDescription, missingSkills = []) => {
  const model = getModel();
  
  const prompt = `
  You are a technical interviewer. Based on the candidate's resume and the job description, generate 8 relevant interview questions. Include a mix of behavioral, technical, and situational questions. Focus on the candidate's background and the skills they might lack (${missingSkills.join(', ')}).
  
  Job Description:
  ${jobDescription}
  
  Resume:
  ${resumeText}
  
  Return strictly a JSON array of objects with the following structure:
  [
    {
      "question": "The interview question text",
      "category": "technical|behavioral|situational|domain",
      "difficulty": "easy|medium|hard"
    }
  ]
  `;

  const result = await model.generateContent(prompt);
  return getJsonFromResponse(result.response.text());
};

export const evaluateAnswer = async (question, answer, jobDescription) => {
  const model = getModel();
  
  const prompt = `
  You are a technical interviewer evaluating a candidate's answer to an interview question.
  
  Job Description Context:
  ${jobDescription}
  
  Question asked:
  ${question}
  
  Candidate's answer:
  ${answer}
  
  Evaluate the answer out of 100 and provide constructive feedback. Return strictly in this JSON format:
  {
    "score": (number 0-100),
    "feedback": "Detailed paragraph of feedback explaining the score",
    "strengths": ["array of 1-3 strings", "noting what they did well"],
    "improvements": ["array of 1-3 strings", "noting what to improve"]
  }
  `;

  const result = await model.generateContent(prompt);
  return getJsonFromResponse(result.response.text());
};

export const generateOverallFeedback = async (questions, jobDescription) => {
  const model = getModel();
  
  const prompt = `
  You are an expert hiring manager writing a final interview evaluation report.
  Review the candidate's performance across the following questions and answers, including the scores they received.
  
  Job Description Context:
  ${jobDescription}
  
  Interview Data (Questions, Candidate's Answers, and Individual Scores):
  ${JSON.stringify(questions, null, 2)}
  
  Provide a final evaluation strictly in JSON format matching this structure:
  {
    "technicalScore": (average of technical questions or overall technical estimate 0-100),
    "communicationScore": (estimate of communication skills 0-100 based on answers),
    "overallScore": (overall score 0-100),
    "strengths": ["array of 2-4 strings summarizing key strengths"],
    "weaknesses": ["array of 2-4 strings summarizing areas of weakness"],
    "suggestions": ["array of 2-4 actionable suggestions for their next interview"],
    "summary": "A cohesive final summary paragraph of their performance"
  }
  `;

  const result = await model.generateContent(prompt);
  return getJsonFromResponse(result.response.text());
};