import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(location.state?.sessionData || null);
  
  const sessionId = location.state?.sessionId;
  const questions = location.state?.questions || [];
  const setup = location.state?.setup || {};

  useEffect(() => {
    if (!sessionId && !session) {
      navigate('/history');
    }
  }, []);

  const overallScore = questions.length > 0 
    ? Math.round(questions.reduce((acc, q) => acc + (q.overall_score || 0), 0) / questions.length) 
    : 0;

  const categoryScores = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q.overall_score);
    return acc;
  }, {});

  const avgCategoryScores = Object.entries(categoryScores).map(([cat, scores]) => ({
    category: cat,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Interview Results</h1>
      <p className="text-gray-500 mb-8">
        {setup.company || 'General'} - {setup.role} ({setup.experienceLevel})
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow text-center col-span-1 md:col-span-1">
          <h2 className="text-gray-500 mb-2">Overall Score</h2>
          <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div className={`h-3 rounded-full ${getScoreBg(overallScore)}`} style={{ width: `${overallScore}%` }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow col-span-1 md:col-span-2">
          <h2 className="text-gray-500 mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {avgCategoryScores.map((cs) => (
              <div key={cs.category} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium text-gray-700 capitalize">{cs.category}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getScoreBg(cs.score)}`} style={{ width: `${cs.score}%` }} />
                </div>
                <span className={`font-bold ${getScoreColor(cs.score)}`}>{cs.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-4 mb-8">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">
                {idx + 1}. {q.question}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(q.overall_score)} bg-gray-100`}>
                {q.overall_score}/100
              </span>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{q.category}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-2">
              <span className="font-semibold">You: </span>{q.user_answer}
            </div>
            {q.feedback && (
              <p className="text-sm text-gray-600 italic">
                <span className="font-semibold not-italic">Feedback:</span> {q.feedback}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/setup')}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
        >
          Start New Interview
        </button>
        <Link 
          to="/roadmap" 
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition text-center"
        >
          Generate Study Roadmap
        </Link>
      </div>
    </div>
  );
}