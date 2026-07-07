import { useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function PracticePage() {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('dsa');
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const res = await API.post('/evaluate/answer', {
        question,
        user_answer: userAnswer,
        category,
      });
      setEvaluation(res.data);
      toast.success('Answer evaluated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Evaluation failed');
    } finally {
      setIsLoading(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">Practice & Evaluate</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 md:p-6 rounded-xl shadow space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dsa">DSA</option>
            <option value="hr">HR</option>
            <option value="behavioral">Behavioral</option>
            <option value="system_design">System Design</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the interview question..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer here..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
        >
          {isLoading ? 'Evaluating...' : 'Evaluate Answer'}
        </button>
      </form>

      {evaluation && (
        <div className="mt-8 space-y-6">
          {/* Overall Score */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow text-center">
            <h2 className="text-lg font-semibold mb-2">Overall Score</h2>
            <div className={`text-5xl md:text-6xl font-bold ${getScoreColor(
              evaluation.overall_score
            )}`}>
              {evaluation.overall_score}
            </div>
            <p className="text-gray-500 mt-1">out of 100</p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
              <div
                className={`h-4 rounded-full ${getScoreBg(evaluation.overall_score)}`}
                style={{ width: `${evaluation.overall_score}%` }}
              />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(evaluation.scores).map(([key, value]) => (
                <div key={key} className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 capitalize mb-1">{key}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${getScoreBg(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Feedback</h2>
            <p className="text-gray-700 break-words whitespace-pre-wrap">{evaluation.feedback}</p>
          </div>

          {/* Improved Answer */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Improved Answer</h2>
            <p className="text-gray-700 whitespace-pre-wrap break-words bg-green-50 p-4 rounded-lg border border-green-200">
              {evaluation.improved_answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}