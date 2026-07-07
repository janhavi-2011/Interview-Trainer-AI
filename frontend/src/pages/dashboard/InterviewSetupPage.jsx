import { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* Same line-icon style as DashboardPage — consistent stroke set, no emoji */
const Icon = {
  Globe: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" />
    </svg>
  ),
  Building: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" />
      <path d="M12 10h7a1 1 0 0 1 1 1v10" />
      <path d="M7.5 8.5h.01M7.5 12h.01M7.5 15.5h.01M15.5 13.5h.01M15.5 17h.01" />
    </svg>
  ),
  Settings: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5c.06-.5.06-1 0-1.5l1.7-1.3-1.7-2.9-2 .6a7.6 7.6 0 0 0-1.3-.75L15.8 5h-3.5l-.3 2.05c-.47.2-.9.45-1.3.75l-2-.6-1.7 2.9 1.7 1.3c-.06.5-.06 1 0 1.5L7 14.8l1.7 2.9 2-.6c.4.3.83.55 1.3.75L12.3 20h3.5l.3-2.05c.47-.2.9-.45 1.3-.75l2 .6 1.7-2.9-1.7-1.3Z" />
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
  Hash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 4 7 20M17 4l-2 16M4 9h16M3 15h16" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6 9 17l-5-5" />
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
};

export default function InterviewSetupPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [role, setRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await API.get('/questions/companies');
      setCompanies(res.data.companies);
    } catch (error) {
      toast.error('Failed to load companies');
    }
  };

  const handleStart = async () => {
    if (!role) return toast.error('Please enter a role');
    setIsGenerating(true);
    try {
      const res = await API.post('/questions/generate', {
        role,
        experience_level: experienceLevel,
        company: selectedCompany?.name,
        categories: ['all'],
        num_questions: numQuestions,
      });

      navigate('/session', { state: { questions: res.data.questions, setup: { role, experienceLevel, company: selectedCompany?.name } } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3]">
          Interview Setup
        </h1>
        <p className="mt-1.5 text-sm text-[#5B5964] dark:text-[#A6A4B0]">
          Configure your practice session or choose a company-specific prep mode.
        </p>
      </div>

      {/* Company Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]">
            <Icon.Building className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-[#1C1B22] dark:text-[#EDEBF3]">
            Choose a Company
            <span className="ml-1.5 font-normal text-sm text-[#8B8994] dark:text-[#75727F]">(Optional)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedCompany(null)}
            className={`relative p-5 rounded-xl border text-left transition-all h-full group
              ${!selectedCompany
                ? 'border-[#4338CA] bg-[#EDEBFB] dark:border-[#6D5EF0]/70 dark:bg-[#25213A] dark:shadow-[0_0_20px_-10px_rgba(109,94,240,0.5)]'
                : 'border-[#E7E4DC] bg-white hover:border-[#C9C6BC] hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1C1B24] dark:border-[#33313D] dark:hover:border-[#4A4758] dark:hover:bg-[#201F29] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
              }`}
          >
            {!selectedCompany && (
              <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#4338CA] text-white dark:bg-[#6D5EF0]">
                <Icon.Check className="h-3 w-3" />
              </span>
            )}
            <span className={`flex h-10 w-10 items-center justify-center rounded-full mb-3
              ${!selectedCompany ? 'bg-white/60 text-[#4338CA] dark:bg-[#6D5EF0]/15 dark:text-[#A79CF5] dark:ring-1 dark:ring-[#6D5EF0]/30' : 'bg-[#EDEBFB] text-[#4338CA] dark:bg-white/[0.04] dark:text-[#A79CF5] dark:ring-1 dark:ring-white/[0.06]'}`}>
              <Icon.Globe className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-[#1C1B22] dark:text-[#EDEBF3]">General Prep</h3>
            <p className="text-sm text-[#8B8994] dark:text-[#75727F] mt-1">Mixed questions across all domains</p>
          </button>

          {companies.map((company) => {
            const active = selectedCompany?.id === company.id;
            return (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                className={`relative p-5 rounded-xl border text-left transition-all h-full
                  ${active
                    ? 'border-[#4338CA] bg-[#EDEBFB] dark:border-[#6D5EF0]/70 dark:bg-[#25213A] dark:shadow-[0_0_20px_-10px_rgba(109,94,240,0.5)]'
                    : 'border-[#E7E4DC] bg-white hover:border-[#C9C6BC] hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1C1B24] dark:border-[#33313D] dark:hover:border-[#4A4758] dark:hover:bg-[#201F29] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
                  }`}
              >
                {active && (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#4338CA] text-white dark:bg-[#6D5EF0]">
                    <Icon.Check className="h-3 w-3" />
                  </span>
                )}
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none bg-black/[0.03] dark:bg-white/[0.04] dark:ring-1 dark:ring-white/[0.06]">
                  {company.icon}
                </span>
                <h3 className="font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mt-2.5">{company.name}</h3>
                <p className="text-xs text-[#8B8994] dark:text-[#9A97A6] mt-1">{company.description}</p>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {company.focus.slice(0, 2).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded text-xs bg-[#F1EFEA] text-[#5B5964] dark:bg-white/[0.06] dark:text-[#B3B0BC] dark:border dark:border-white/[0.06]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Configuration */}
      <div className="bg-white border border-[#E7E4DC] p-6 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]">
            <Icon.Settings className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-[#1C1B22] dark:text-[#EDEBF3]">Session Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0] mb-1.5">
              <Icon.User className="h-3.5 w-3.5" />
              Target Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E7E4DC] bg-white text-[#1C1B22] placeholder-[#8B8994] focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] focus:outline-none transition-colors
                dark:bg-[#121218] dark:border-[#3D3A48] dark:text-[#EDEBF3] dark:focus:ring-[#6D5EF0]/30 dark:focus:border-[#6D5EF0]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0] mb-1.5">
              <Icon.Layers className="h-3.5 w-3.5" />
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E7E4DC] bg-white text-[#1C1B22] focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] focus:outline-none transition-colors
                dark:bg-[#121218] dark:border-[#3D3A48] dark:text-[#EDEBF3] dark:focus:ring-[#6D5EF0]/30 dark:focus:border-[#6D5EF0]"
            >
              <option value="junior">Junior (0-2 yrs)</option>
              <option value="mid">Mid (3-5 yrs)</option>
              <option value="senior">Senior (6-10 yrs)</option>
              <option value="lead">Lead (10+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0] mb-1.5">
              <Icon.Hash className="h-3.5 w-3.5" />
              Questions
              <span className="ml-auto text-[#4338CA] dark:text-[#A79CF5] font-semibold">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full mt-3 accent-[#4338CA] dark:accent-[#6D5EF0]"
            />
            <div className="flex justify-between text-xs text-[#8B8994] dark:text-[#75727F] mt-1">
              <span>3</span><span>15</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={isGenerating || !role}
          className="w-full mt-7 py-3.5 rounded-lg font-semibold text-base text-white transition-all
            bg-gradient-to-br from-[#4338CA] to-[#332C9E] hover:shadow-lg hover:-translate-y-0.5
            disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none
            dark:from-[#4338CA] dark:to-[#332C9E] dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.4)] dark:hover:shadow-[0_0_32px_-6px_rgba(109,94,240,0.55)]
            flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Icon.Spinner className="h-5 w-5" />
              AI is crafting your questions...
            </>
          ) : (
            <>
              <Icon.Sparkle className="h-5 w-5" />
              Start Interview Session
            </>
          )}
        </button>
      </div>
    </div>
    </div>
  );
}
