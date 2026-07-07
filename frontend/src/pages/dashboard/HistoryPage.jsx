import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

/* Same line-icon style as the rest of the app — consistent stroke set, no emoji */
const Icon = {
  Inbox: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12h4l1.5 3h5L16 12h4" />
      <path d="M5.5 5h13L21 12v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6L5.5 5Z" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </svg>
  ),
  Layers: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </svg>
  ),
  Building: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" />
      <path d="M12 10h7a1 1 0 0 1 1 1v10" />
      <path d="M7.5 8.5h.01M7.5 12h.01M7.5 15.5h.01M15.5 13.5h.01M15.5 17h.01" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  ),
  MessageSquare: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4.5h16v11H8.5L4 19.5v-15Z" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  ),
  Spinner: (p) => (
    <svg viewBox="0 0 24 24" fill="none" className="animate-spin" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  MousePointerClick: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m5 4 6 15 2-6 6-2-14-7Z" />
      <path d="m15 15 4.5 4.5" />
    </svg>
  ),
};

const difficultyStyles = {
  Hard: 'bg-[#FBEAE9] text-[#B3261E] dark:bg-[#3A1E1D] dark:text-[#F2938C]',
  Medium: 'bg-[#FEF3E2] text-[#B45309] dark:bg-[#3A2E17] dark:text-[#F0B268]',
  Easy: 'bg-[#E9F6EC] text-[#1E7A34] dark:bg-[#173A20] dark:text-[#7FD99A]',
};

function scoreBadge(score) {
  if (score >= 80) return 'text-[#1E7A34] bg-[#E9F6EC] dark:text-[#7FD99A] dark:bg-[#173A20]';
  if (score >= 60) return 'text-[#B45309] bg-[#FEF3E2] dark:text-[#F0B268] dark:bg-[#3A2E17]';
  return 'text-[#B3261E] bg-[#FBEAE9] dark:text-[#F2938C] dark:bg-[#3A1E1D]';
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await API.get('/history/sessions');
      setSessions(res.data.sessions);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionDetail = async (id) => {
    setIsDetailLoading(true);
    try {
      const res = await API.get(`/history/session/${id}`);
      setSelectedSession(res.data);
    } catch (error) {
      toast.error('Failed to load session detail');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const wrapperClass = "w-full max-w-6xl mx-auto py-6";

  if (isLoading) {
    return (
      <div className={`${wrapperClass} flex items-center justify-center gap-2 text-sm text-[#8B8994] dark:text-[#75727F]`}>
        <Icon.Spinner className="h-4 w-4" />
        Loading history...
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3] mb-6">
        Interview History
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-3">
          {sessions.length === 0 ? (
            <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm text-center text-[#8B8994] dark:bg-[#1C1B24] dark:border-[#33313D] dark:text-[#75727F] transition-colors">
              No sessions yet. Start practicing!
            </div>
          ) : (
            sessions.map((session) => {
              const active = selectedSession?._id === session._id;
              return (
                <div
                  key={session._id}
                  onClick={() => fetchSessionDetail(session._id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all
                    ${active
                      ? 'border-[#4338CA] bg-[#EDEBFB] shadow-sm dark:border-[#6D5EF0]/70 dark:bg-[#25213A] dark:shadow-[0_0_20px_-10px_rgba(109,94,240,0.5)]'
                      : 'border-[#E7E4DC] bg-white hover:border-[#C9C6BC] hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1C1B24] dark:border-[#33313D] dark:hover:border-[#4A4758] dark:hover:bg-[#201F29] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
                    }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#1C1B22] dark:text-[#EDEBF3] break-words">
                        {session.session_name}
                      </h3>
                      <p className="text-xs text-[#8B8994] dark:text-[#9A97A6] mt-1 break-words">
                        {session.role} • {session.experience_level}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-[#8B8994] dark:text-[#75727F] mt-1.5">
                        <Icon.Calendar className="h-3 w-3" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap ${scoreBadge(session.overall_score)}`}>
                      {session.overall_score}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2">
          {isDetailLoading ? (
            <div className="bg-white border border-[#E7E4DC] p-8 md:p-12 rounded-xl shadow-sm text-center flex items-center justify-center gap-2 text-[#8B8994] dark:bg-[#1C1B24] dark:border-[#33313D] dark:text-[#75727F] transition-colors">
              <Icon.Spinner className="h-4 w-4" />
              Loading session...
            </div>
          ) : selectedSession ? (
            <div className="space-y-4">

              {/* Header Card */}
              <div className="bg-white border border-[#E7E4DC] p-4 md:p-6 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
                <h2 className="text-xl font-semibold text-[#1C1B22] dark:text-[#EDEBF3] break-words">
                  {selectedSession.session_name}
                </h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-[#5B5964] dark:text-[#A6A4B0]">
                  <span className="flex items-center gap-1.5">
                    <Icon.User className="h-3.5 w-3.5" />
                    Role: {selectedSession.role}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon.Layers className="h-3.5 w-3.5" />
                    Level: {selectedSession.experience_level}
                  </span>
                  {selectedSession.company && (
                    <span className="flex items-center gap-1.5">
                      <Icon.Building className="h-3.5 w-3.5" />
                      Company: {selectedSession.company}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${scoreBadge(selectedSession.overall_score)}`}>
                    Overall: {selectedSession.overall_score}/100
                  </span>
                </div>
              </div>

              {/* Questions */}
              {selectedSession.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E7E4DC] p-4 md:p-5 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <h3 className="font-semibold text-[#1C1B22] dark:text-[#EDEBF3] break-words">
                      {idx + 1}. {q.question}
                    </h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap ${scoreBadge(q.overall_score)}`}>
                      {q.overall_score}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#EDEBFB] text-[#4338CA] rounded text-xs dark:bg-[#2A2740] dark:text-[#A79CF5]">
                      {q.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${difficultyStyles[q.difficulty] || difficultyStyles.Easy}`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="bg-[#F6F5F1] p-3 rounded-lg mb-3 dark:bg-[#121218] dark:border dark:border-[#2C2A35] transition-colors">
                    <p className="text-sm text-[#5B5964] dark:text-[#A6A4B0] whitespace-pre-wrap break-words">
                      <span className="font-medium text-[#1C1B22] dark:text-[#EDEBF3]">Your Answer:</span>{' '}
                      {q.user_answer}
                    </p>
                  </div>

                  {q.feedback && (
                    <div className="bg-[#E9F6EC] border border-[#CDEBD4] rounded-lg p-3 dark:bg-[#173A20]/40 dark:border-[#2A5A38] transition-colors">
                      <p className="flex items-start gap-1.5 text-sm text-[#1C1B22] dark:text-[#D6F0DC] whitespace-pre-wrap break-words">
                        <Icon.Sparkle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1E7A34] dark:text-[#7FD99A]" />
                        <span>
                          <span className="font-medium">Feedback:</span> {q.feedback}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ))}

            </div>
          ) : (
            <div className="bg-white border border-[#E7E4DC] p-8 md:p-12 rounded-xl shadow-sm text-center dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]">
                <Icon.MousePointerClick className="h-5 w-5" />
              </div>
              <p className="text-[#8B8994] dark:text-[#75727F]">Select a session to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
    </div>
  );
}