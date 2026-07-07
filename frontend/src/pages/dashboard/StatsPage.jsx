import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

/* Same line-icon style as the rest of the app — consistent stroke set, no emoji */
const Icon = {
  Layers: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </svg>
  ),
  MessageSquare: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4.5h16v11H8.5L4 19.5v-15Z" />
    </svg>
  ),
  Gauge: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4.5 16a7.5 7.5 0 1 1 15 0" />
      <path d="M12 16 15 11" />
    </svg>
  ),
  Trophy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
      <path d="M12 14v3M9 21h6M9.5 21c0-1.9.7-2.6 2.5-3 1.8.4 2.5 1.1 2.5 3" />
    </svg>
  ),
  AlertTriangle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  ),
};

/* Detects the current theme by watching the `dark` class on <html>, so
   Recharts (which needs real color values, not Tailwind classes) can react
   live when the user toggles the theme from DashboardPage. */
function useIsDark() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = useIsDark();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const chart = {
    grid: isDark ? '#2C2A35' : '#E7E4DC',
    tick: isDark ? '#A6A4B0' : '#5B5964',
    tooltipBg: isDark ? '#1C1B24' : '#FFFFFF',
    tooltipBorder: isDark ? '#33313D' : '#E7E4DC',
    tooltipText: isDark ? '#EDEBF3' : '#1C1B22',
    primary: isDark ? '#8B7DF2' : '#4338CA',
    bar: isDark ? '#6D5EF0' : '#4F46E5',
    line: isDark ? '#7FD99A' : '#0E9F52',
  };

  const tooltipStyle = {
    backgroundColor: chart.tooltipBg,
    border: `1px solid ${chart.tooltipBorder}`,
    borderRadius: 8,
    color: chart.tooltipText,
    fontSize: 13,
  };

  const wrapperClass = "min-h-[calc(100vh-57px)] -m-4 lg:-m-8 -mb-24 lg:-mb-8 p-4 lg:p-8 pb-24 lg:pb-8 bg-[#F6F5F1] dark:bg-[#121218] transition-colors flex items-center justify-center";

  if (isLoading) {
    return (
      <div className={wrapperClass}>
        <p className="text-sm text-[#8B8994] dark:text-[#75727F]">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={wrapperClass}>
        <p className="text-sm text-[#8B8994] dark:text-[#75727F]">No data available</p>
      </div>
    );
  }

  // Prepare radar chart data (score breakdown)
  const radarData = [
    { subject: 'Accuracy', score: stats.score_breakdown.accuracy, fullMark: 100 },
    { subject: 'Clarity', score: stats.score_breakdown.clarity, fullMark: 100 },
    { subject: 'Completeness', score: stats.score_breakdown.completeness, fullMark: 100 },
    { subject: 'Confidence', score: stats.score_breakdown.confidence, fullMark: 100 },
  ];

  // Prepare bar chart data (category scores)
  const barData = stats.category_scores.map((cs) => ({
    category: cs.category.toUpperCase(),
    score: cs.average_score,
    questions: cs.questions_answered,
  }));

  // Prepare line chart data (score trend)
  const lineData = stats.score_trend.map((t) => ({
    label: t.label,
    score: t.score,
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#1E7A34] dark:text-[#7FD99A]';
    if (score >= 60) return 'text-[#B45309] dark:text-[#F0B268]';
    return 'text-[#B3261E] dark:text-[#F2938C]';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-[#1E7A34] dark:bg-[#3EA85E]';
    if (score >= 60) return 'bg-[#D97706] dark:bg-[#E0A54C]';
    return 'bg-[#DC2626] dark:bg-[#E0665F]';
  };

  return (
    <div className="min-h-[calc(100vh-57px)] -m-4 lg:-m-8 -mb-24 lg:-mb-8 p-4 lg:p-8 pb-24 lg:pb-8 bg-[#F6F5F1] dark:bg-[#121218] transition-colors">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3] mb-6">
        Performance Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E7E4DC] p-5 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <div className="flex items-center gap-1.5 text-sm text-[#8B8994] dark:text-[#75727F]">
            <Icon.Layers className="h-3.5 w-3.5" />
            Total Sessions
          </div>
          <p className="text-3xl font-bold text-[#4338CA] dark:text-[#A79CF5] mt-1.5">{stats.total_sessions}</p>
        </div>
        <div className="bg-white border border-[#E7E4DC] p-5 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <div className="flex items-center gap-1.5 text-sm text-[#8B8994] dark:text-[#75727F]">
            <Icon.MessageSquare className="h-3.5 w-3.5" />
            Questions Answered
          </div>
          <p className="text-3xl font-bold text-[#4338CA] dark:text-[#A79CF5] mt-1.5">{stats.total_questions_answered}</p>
        </div>
        <div className="bg-white border border-[#E7E4DC] p-5 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <div className="flex items-center gap-1.5 text-sm text-[#8B8994] dark:text-[#75727F]">
            <Icon.Gauge className="h-3.5 w-3.5" />
            Average Score
          </div>
          <p className={`text-3xl font-bold mt-1.5 ${getScoreColor(stats.overall_avg_score)}`}>
            {stats.overall_avg_score}
          </p>
        </div>
        <div className="bg-white border border-[#E7E4DC] p-5 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <div className="flex items-center gap-1.5 text-sm text-[#8B8994] dark:text-[#75727F]">
            <Icon.Trophy className="h-3.5 w-3.5" />
            Best Score
          </div>
          <p className="text-3xl font-bold text-[#1E7A34] dark:text-[#7FD99A] mt-1.5">{stats.max_score}</p>
        </div>
      </div>

      {/* Weak Topics Alert */}
      {stats.weak_topics.length > 0 && (
        <div className="bg-[#FBEAE9] border border-[#F5C6C3] p-4 md:p-6 rounded-xl mb-8 dark:bg-[#2A1D1D] dark:border-[#4A2E2C] transition-colors">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#B3261E] dark:text-[#F2938C] mb-3">
            <Icon.AlertTriangle className="h-4 w-4" />
            Weak Areas Needing Improvement
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.weak_topics.map((wt, idx) => (
              <div
                key={idx}
                className="bg-white w-full sm:w-auto px-4 py-3 rounded-lg shadow-sm border border-[#F5C6C3] dark:bg-[#1C1B24] dark:border-[#4A2E2C] transition-colors"
              >
                <p className="font-medium text-[#B3261E] dark:text-[#F2938C] capitalize">{wt.category}</p>
                <p className="text-sm text-[#C0453D] dark:text-[#D97F78]">Avg Score: {wt.average_score}/100</p>
                <div className="w-full bg-[#F5C6C3] dark:bg-[#4A2E2C] rounded-full h-2 mt-1.5">
                  <div className="bg-[#DC2626] dark:bg-[#E0665F] h-2 rounded-full" style={{ width: `${wt.average_score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart - Score Breakdown */}
        <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <h2 className="text-base font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-4">Skill Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={chart.grid} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: chart.tick, fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: chart.tick, fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke={chart.primary} fill={chart.primary} fillOpacity={0.4} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Category Scores */}
        <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <h2 className="text-base font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-4">Category Performance</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="category" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={{ stroke: chart.grid }} />
                <YAxis domain={[0, 100]} tick={{ fill: chart.tick, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={{ stroke: chart.grid }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="score" fill={chart.bar} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#8B8994] dark:text-[#75727F]">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* Score Trend */}
      {lineData.length > 0 && (
        <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm mb-8 dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
          <h2 className="text-base font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-4">Score Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="label" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={{ stroke: chart.grid }} />
              <YAxis domain={[0, 100]} tick={{ fill: chart.tick, fontSize: 12 }} axisLine={{ stroke: chart.grid }} tickLine={{ stroke: chart.grid }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke={chart.line} strokeWidth={3} dot={{ r: 5, fill: chart.line }} />
            </LineChart>
          </ResponsiveContainer>
          {lineData.length === 1 && (
            <p className="text-center text-[#8B8994] dark:text-[#75727F] text-sm mt-3">
              Complete another interview session to view your performance trend.
            </p>
          )}
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
        <h2 className="text-base font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-4">Recent Sessions</h2>
        {stats.recent_sessions.length === 0 ? (
          <p className="text-[#8B8994] dark:text-[#75727F] text-center py-8">No sessions yet. Start practicing!</p>
        ) : (
          <div className="space-y-3">
            {stats.recent_sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-[#F6F5F1] dark:bg-[#121218] dark:border dark:border-[#2C2A35] transition-colors"
              >
                <div>
                  <p className="font-medium text-[#1C1B22] dark:text-[#EDEBF3] break-words">{session.session_name}</p>
                  <p className="text-sm text-[#8B8994] dark:text-[#75727F] break-words">
                    {session.total_questions} questions • {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:w-32 bg-[#E7E4DC] dark:bg-[#2C2A35] rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getScoreBg(session.overall_score)}`}
                      style={{ width: `${session.overall_score}%` }}
                    />
                  </div>
                  <span className={`font-bold ${getScoreColor(session.overall_score)}`}>
                    {session.overall_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}