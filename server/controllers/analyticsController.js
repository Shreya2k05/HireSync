import { Interview, Resume } from '../models/index.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's completed interviews
    const interviews = await Interview.find({ user: userId, status: 'completed' }).sort({ createdAt: 1 });
    
    // Fetch user's resumes
    const resumes = await Resume.find({ user: userId }).sort({ createdAt: 1 });

    // 1. Stats
    const totalInterviews = interviews.length;
    let sumScore = 0;
    let bestScore = 0;
    interviews.forEach(inv => {
      const score = inv.overallFeedback?.overallScore || 0;
      sumScore += score;
      if (score > bestScore) bestScore = score;
    });
    const avgScore = totalInterviews > 0 ? Math.round(sumScore / totalInterviews) : 0;

    let latestAtsScore = 0;
    if (resumes.length > 0) {
      const latestResume = resumes[resumes.length - 1];
      latestAtsScore = latestResume.latestAtsScore || 0;
    }

    const stats = [
      { label: 'Total Interviews', value: totalInterviews, icon: '🎤', color: '#8B5CF6' },
      { label: 'Average Score', value: `${avgScore}%`, icon: '📊', color: '#22D3EE' },
      { label: 'Best Score', value: `${bestScore}%`, icon: '🏆', color: '#EC4899' },
      { label: 'ATS Score', value: `${latestAtsScore}%`, icon: '📄', color: '#F59E0B' },
    ];

    // 2. Score History
    const scoreHistory = interviews.map((inv, index) => {
      const date = new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { session: `S${index + 1}`, score: inv.overallFeedback?.overallScore || 0, date };
    });

    // 3. Category Scores & Pie Data
    const categoryTotals = { Technical: { sum: 0, count: 0 }, Behavioral: { sum: 0, count: 0 }, Situational: { sum: 0, count: 0 }, Domain: { sum: 0, count: 0 } };
    
    interviews.forEach(inv => {
      inv.questions.forEach(q => {
        let cat = q.category ? q.category.charAt(0).toUpperCase() + q.category.slice(1) : 'Technical';
        if (categoryTotals[cat]) {
          categoryTotals[cat].sum += q.score || 0;
          categoryTotals[cat].count += 1;
        }
      });
    });

    const categoryScores = [];
    const pieData = [];
    const colors = { Technical: '#8B5CF6', Behavioral: '#22D3EE', Situational: '#EC4899', Domain: '#F59E0B' };
    
    for (const [cat, data] of Object.entries(categoryTotals)) {
      if (data.count > 0) {
        categoryScores.push({ category: cat, score: Math.round(data.sum / data.count), count: data.count });
        pieData.push({ name: cat, value: data.count, color: colors[cat] || '#8B5CF6' });
      }
    }

    // 4. Skill Radar
    let skillRadar = [
      { skill: 'Technical', score: categoryTotals['Technical']?.count > 0 ? Math.round(categoryTotals['Technical'].sum / categoryTotals['Technical'].count) : 0 },
      { skill: 'Behavioral', score: categoryTotals['Behavioral']?.count > 0 ? Math.round(categoryTotals['Behavioral'].sum / categoryTotals['Behavioral'].count) : 0 },
      { skill: 'Communication', score: totalInterviews > 0 ? Math.round(interviews.reduce((acc, curr) => acc + (curr.overallFeedback?.communicationScore || 0), 0) / totalInterviews) : 0 },
      { skill: 'Situational', score: categoryTotals['Situational']?.count > 0 ? Math.round(categoryTotals['Situational'].sum / categoryTotals['Situational'].count) : 0 },
      { skill: 'Domain', score: categoryTotals['Domain']?.count > 0 ? Math.round(categoryTotals['Domain'].sum / categoryTotals['Domain'].count) : 0 },
    ];

    // Filter out skills with 0 score if there are other scores, or just keep them all.
    // Radar charts look weird with a single point, keeping all is better.

    // 5. Weak Areas (Extract weaknesses from recent interviews)
    let weakAreasMap = {};
    interviews.forEach(inv => {
      (inv.overallFeedback?.weaknesses || []).forEach(w => {
        // truncate if too long
        let shortW = w.length > 30 ? w.substring(0, 27) + '...' : w;
        if (!weakAreasMap[shortW]) weakAreasMap[shortW] = { skill: shortW, score: Math.floor(Math.random() * 20) + 40, sessions: 1 };
        else weakAreasMap[shortW].sessions += 1;
      });
    });
    
    let weakAreas = Object.values(weakAreasMap).sort((a,b) => b.sessions - a.sessions).slice(0, 4);

    // 6. Recent Interviews
    const recentInterviews = [...interviews].reverse().slice(0, 5).map(inv => ({
      role: inv.jobTitle || 'Software Engineer',
      score: inv.overallFeedback?.overallScore || 0,
      date: new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: `${inv.durationMinutes} min`,
      status: inv.status
    }));

    // 7. ATS History
    const atsHistory = [];
    resumes.forEach(res => {
      res.analyses.forEach((ana, i) => {
        atsHistory.push({
          label: `V${i + 1} - ${new Date(ana.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          score: ana.atsScore
        });
      });
    });

    const analyticsData = {
      stats,
      scoreHistory,
      skillRadar,
      categoryScores,
      pieData,
      recentInterviews,
      weakAreas,
      atsHistory
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
