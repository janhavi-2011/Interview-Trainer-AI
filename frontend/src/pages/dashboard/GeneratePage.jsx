import { useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function GeneratePage() {
  const [role, setRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [company, setCompany] = useState('');
  const [categories, setCategories] = useState(['all']);
  const [numQuestions, setNumQuestions] = useState(10);
  const [focusTopics, setFocusTopics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const categoryOptions = [
    { value: 'all', label: 'All' },
    { value: 'dsa', label: 'DSA' },
    { value: 'hr', label: 'HR' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'system_design', label: 'System Design' },
  ];

  const handleCategoryToggle = (value) => {
    if (value === 'all') {
      setCategories(['all']);
      return;
    }
    const newCats = categories.filter((c) => c !== 'all');
    if (newCats.includes(value)) {
      const updated = newCats.filter((c) => c !== value);
      setCategories(updated.length === 0 ? ['all'] : updated);
    } else {
      setCategories([...newCats, value]);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const body = {
        role,
        experience_level: experienceLevel,
        company: company || undefined,
        categories,
        num_questions: numQuestions,
        focus_topics: focusTopics ? focusTopics.split(',').map((t) => t.trim()) : undefined,
      };
      const res = await API.post('/questions/generate', body);
      setResult(res.data);
      toast.success(`Generated ${res.data.total_questions} questions!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryColors = {
    dsa: 'bg-green-100 text-green-800',
    hr: 'bg-purple-100 text-purple-800',
    behavioral: 'bg-yellow-100 text-yellow-800',
    system_design: 'bg-red-100 text-red-800',
  };

  const difficultyColors = {
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500',
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Generate Interview Questions</h1>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="junior">Junior (0-2 years)</option>
              <option value="mid">Mid (3-5 years)</option>
              <option value="senior">Senior (6-10 years)</option>
              <option value="lead">Lead (10+ years)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Google, Amazon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value) || 1)}
              min={1}
              max={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleCategoryToggle(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                  ${categories.includes(opt.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Focus Topics (comma-separated, optional)
          </label>
          <input
            type="text"
            value={focusTopics}
            onChange={(e) => setFocusTopics(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., arrays, caching, leadership"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !role}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? 'Generating Questions...' : `Generate ${numQuestions} Questions`}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-xl font-bold">
              {result.total_questions} Questions for {result.role} ({result.experience_level})
            </h2>
            {result.company && (
              <span className="self-start px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {result.company}
              </span>
            )}
          </div>

          {result.questions.map((q, idx) => (
            <div key={idx} className="bg-white p-4 md:p-5 rounded-xl shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 break-words">
                  {idx + 1}. {q.question}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[q.category] || 'bg-gray-100 text-gray-800'}`}>
                  {q.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${difficultyColors[q.difficulty] || 'bg-gray-500'}`}>
                  {q.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {q.topic}
                </span>
              </div>
              {q.hint && (
                <p className="text-sm text-gray-500 mb-2 break-words">
                  💡 Hint: {q.hint}
                </p>
              )}
              {q.evaluation_criteria && q.evaluation_criteria.length > 0 && (
                <div className="text-xs text-gray-500 break-words">
                  <span className="font-medium">Evaluation: </span>
                  {q.evaluation_criteria.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}