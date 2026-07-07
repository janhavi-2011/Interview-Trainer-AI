import { useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

/* Same line-icon style as the rest of the app — consistent stroke set, no emoji */
const Icon = {
  Video: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 10 6-3v10l-6-3" />
    </svg>
  ),
  FileText: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 3.5h7L18.5 8V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.5M9 12.5h6M9 16h6" />
    </svg>
  ),
  Code: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
    </svg>
  ),
  Link: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.6 4.9a3.6 3.6 0 0 1 5.1 5.1L16 11.6M13 17.5l-1.6 1.6a3.6 3.6 0 0 1-5.1-5.1L8 12.4" />
    </svg>
  ),
  Sparkles: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  Square: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
    </svg>
  ),
  Spinner: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="animate-spin" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
};

function ResourceIcon({ type, className }) {
  switch (type) {
    case 'video':
      return <Icon.Video className={className} />;
    case 'article':
      return <Icon.FileText className={className} />;
    case 'practice':
      return <Icon.Code className={className} />;
    default:
      return <Icon.Link className={className} />;
  }
}

export default function RoadmapPage() {
  const [duration, setDuration] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const generateRoadmap = async () => {
    setIsLoading(true);
    try {
      const res = await API.post('/roadmap/generate', {
        duration_days: duration,
      });

      setRoadmap(res.data);
      toast.success(`${duration}-day roadmap generated!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
    <div>

      <h1 className="text-2xl font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3] mb-6">
        Personalized Study Roadmap
      </h1>

      {/* Controls */}
      <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm mb-8 dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">

        <p className="text-[#5B5964] dark:text-[#A6A4B0] mb-4">
          Generate a personalized study plan based on your weak areas and past performance.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">

          <label className="text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0]">
            Duration:
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDuration(7)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
                ${duration === 7
                  ? 'bg-[#4338CA] text-white dark:bg-[#6D5EF0]'
                  : 'bg-[#F1EFEA] text-[#5B5964] hover:bg-[#E7E4DC] dark:bg-white/[0.06] dark:text-[#B3B0BC] dark:hover:bg-white/[0.1]'
                }`}
            >
              7 Days
            </button>

            <button
              onClick={() => setDuration(15)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
                ${duration === 15
                  ? 'bg-[#4338CA] text-white dark:bg-[#6D5EF0]'
                  : 'bg-[#F1EFEA] text-[#5B5964] hover:bg-[#E7E4DC] dark:bg-white/[0.06] dark:text-[#B3B0BC] dark:hover:bg-white/[0.1]'
                }`}
            >
              15 Days
            </button>
          </div>

        </div>

        <button
          onClick={generateRoadmap}
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-semibold text-white transition-all
            bg-gradient-to-br from-[#4338CA] to-[#332C9E] hover:shadow-lg hover:-translate-y-0.5
            disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none
            dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.4)] dark:hover:shadow-[0_0_32px_-6px_rgba(109,94,240,0.55)]
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Icon.Spinner className="h-5 w-5" />
              Generating Roadmap...
            </>
          ) : (
            `Generate ${duration}-Day Plan`
          )}
        </button>

      </div>

      {roadmap && (
        <div className="space-y-6">

          {/* Header */}
          <div className="p-4 md:p-6 rounded-xl border bg-[#EDEBFB] border-[#D8D2F5] dark:bg-[#25213A] dark:border-[#3D3880] dark:shadow-[0_0_20px_-10px_rgba(109,94,240,0.35)] transition-colors">
            <h2 className="text-lg font-semibold text-[#332C9E] dark:text-[#C4BCF7]">
              Your {roadmap.duration_days}-Day Study Plan
            </h2>

            <p className="text-sm text-[#4338CA] dark:text-[#A79CF5] mt-2 break-words">
              <strong>Focus:</strong> {roadmap.weak_topics.join(', ')}
            </p>

            <p className="flex items-center gap-1.5 text-sm text-[#5B5AA8] dark:text-[#9C97C7] mt-1.5">
              <Icon.Clock className="h-3.5 w-3.5" />
              Estimated Time: {roadmap.total_estimated_hours} hours
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#D8D2F5] dark:bg-[#33313D]" />

            {roadmap.plan.map((day) => (
              <div key={day.day} className="relative pl-14 pb-8">

                <div className="absolute left-3 top-3 w-5 h-5 rounded-full bg-[#4338CA] border-4 border-[#F6F5F1] dark:bg-[#6D5EF0] dark:border-[#121218] shadow" />

                <div className="bg-white border border-[#E7E4DC] p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all dark:bg-[#1C1B24] dark:border-[#33313D] dark:hover:border-[#4A4758] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-[#4338CA] dark:text-[#A79CF5]">
                        Day {day.day}
                      </span>
                      <h3 className="text-lg font-semibold text-[#1C1B22] dark:text-[#EDEBF3] break-words">
                        {day.title}
                      </h3>
                    </div>

                    <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]">
                      <Icon.Clock className="h-3 w-3" />
                      ~{day.estimated_hours}h
                    </span>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {day.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-xs bg-[#F1EFEA] text-[#5B5964] dark:bg-white/[0.06] dark:text-[#B3B0BC]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Tasks */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0] mb-2">
                      Tasks
                    </p>
                    <ul className="space-y-2">
                      {day.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#5B5964] dark:text-[#A6A4B0]">
                          <Icon.Square className="h-4 w-4 mt-0.5 shrink-0 text-[#C9C6BC] dark:text-[#4A4758]" />
                          <span className="break-words">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  {day.resources?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0] mb-2">
                        Resources
                      </p>
                      <div className="space-y-2">
                        {day.resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 text-sm text-[#4338CA] hover:text-[#332C9E] hover:underline break-all dark:text-[#A79CF5] dark:hover:text-[#C4BCF7]"
                          >
                            <ResourceIcon type={resource.type} className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{resource.title}</span>
                            <span className="text-xs text-[#8B8994] dark:text-[#75727F]">({resource.type})</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
    </div>
  );
}