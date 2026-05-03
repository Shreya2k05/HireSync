export const analyzeResume = async (resumeText, jobDescription) => {
  return {
    atsScore: 74,
    compatibilityPct: 70,
    matchedSkills: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'Git', 'MongoDB'],
    missingSkills: ['TypeScript', 'Docker', 'AWS', 'GraphQL', 'Redis'],
    suggestions: [
      'Add TypeScript to your skillset as it is required in the job description',
      'Mention any cloud platform experience such as AWS or GCP',
      'Include specific metrics and achievements in your work experience sections',
      'Add a projects section showcasing relevant personal or open source work',
      'Include keywords from the job description naturally throughout your resume',
    ],
    summary: 'Your profile shows strong frontend and backend development skills. The role requires cloud infrastructure experience not currently reflected in your resume.',
  }
}

export const generateInterviewQuestions = async (resumeText, jobDescription, missingSkills = []) => {
  return [
    { question: 'Tell me about yourself and your experience with the technologies mentioned in your resume.', category: 'behavioral', difficulty: 'easy' },
    { question: 'Explain the difference between REST and GraphQL APIs. When would you choose one over the other?', category: 'technical', difficulty: 'medium' },
    { question: 'Describe a challenging project you worked on. What was your approach to solving the main problems?', category: 'behavioral', difficulty: 'medium' },
    { question: 'How would you design a scalable authentication system for a large web application?', category: 'technical', difficulty: 'hard' },
    { question: 'You have a feature deadline tomorrow but discover a critical bug. How do you handle it?', category: 'situational', difficulty: 'medium' },
    { question: 'Explain how you would optimize a slow database query in MongoDB.', category: 'technical', difficulty: 'hard' },
    { question: 'How do you stay updated with new technologies and best practices in software development?', category: 'behavioral', difficulty: 'easy' },
    { question: 'Walk me through how you would architect a real-time notification system.', category: 'domain', difficulty: 'hard' },
  ]
}

export const evaluateAnswer = async (question, answer, jobDescription) => {
  const score = Math.floor(Math.random() * 30) + 60
  return {
    score,
    feedback: 'Good answer overall. You demonstrated clear understanding of the concept and provided relevant examples. Consider adding more specific metrics or outcomes to strengthen your response.',
    strengths: ['Clear communication', 'Relevant example provided'],
    improvements: ['Add specific metrics', 'Mention trade-offs'],
  }
}

export const generateOverallFeedback = async (questions, jobDescription) => {
  const scores = questions.map(q => q.score || 70)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return {
    technicalScore: avg + 2,
    communicationScore: avg - 3,
    overallScore: avg,
    strengths: [
      'Strong technical foundation across core concepts',
      'Clear and structured communication style',
      'Good problem-solving approach demonstrated',
    ],
    weaknesses: [
      'Could provide more specific examples with measurable outcomes',
      'System design answers need more depth',
    ],
    suggestions: [
      'Practice explaining complex technical concepts in simple terms',
      'Prepare 3-4 strong STAR method stories for behavioral questions',
      'Study system design patterns for scalability and reliability',
    ],
    summary: 'You performed well overall showing solid technical knowledge and good communication skills. Focus on providing more specific examples with measurable outcomes and deepening your system design knowledge before your next interview.',
  }
}