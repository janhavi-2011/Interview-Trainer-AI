import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

/* Same line-icon style as DashboardPage / InterviewSetupPage — consistent stroke set, no emoji */
const Icon = {
  Lightbulb: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.44.9 1.05.9 1.6h5.2c0-.55.3-1.16.9-1.6A6 6 0 0 0 12 3Z" />
    </svg>
  ),
  ArrowRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  ),
  Flag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
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
};

const difficultyStyles = {
  Hard: 'bg-[#FBEAE9] text-[#B3261E] dark:bg-[#3A1E1D] dark:text-[#F2938C]',
  Medium: 'bg-[#FEF3E2] text-[#B45309] dark:bg-[#3A2E17] dark:text-[#F0B268]',
  Easy: 'bg-[#E9F6EC] text-[#1E7A34] dark:bg-[#173A20] dark:text-[#7FD99A]',
};

function scoreColor(score) {
  if (score >= 70) return 'text-[#1E7A34] dark:text-[#7FD99A]';
  if (score >= 50) return 'text-[#B45309] dark:text-[#F0B268]';
  return 'text-[#B3261E] dark:text-[#F2938C]';
}

export default function InterviewSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [setup, setSetup] = useState(location.state?.setup || {});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!location.state?.questions) {
      toast.error('No questions found. Please set up an interview first.');
      navigate('/setup');
    }
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (value) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleSubmitAnswer = async () => {
    if (!answers[currentIndex]?.trim()) {
      return toast.error('Please write an answer before submitting.');
    }
    setIsEvaluating(true);
    try {
      const res = await API.post('/evaluate/answer', {
        question: currentQuestion.question,
        user_answer: answers[currentIndex],
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
      });
      setEvaluations({ ...evaluations, [currentIndex]: res.data });
      setShowFeedback(true);
    } catch (error) {
      toast.error('Evaluation failed. Try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    try {
      const sessionQuestions = questions.map((q, idx) => ({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        user_answer: answers[idx] || "No answer provided",
        scores: evaluations[idx]?.scores || { accuracy: 0, clarity: 0, completeness: 0, confidence: 0 },
        overall_score: evaluations[idx]?.overall_score || 0,
        feedback: evaluations[idx]?.feedback || "Not evaluated",
      }));

      const res = await API.post('/history/session', {
        session_name: `${setup.company || 'General'} - ${setup.role}`,
        role: setup.role,
        experience_level: setup.experienceLevel,
        company: setup.company,
        questions: sessionQuestions,
      });

      navigate('/results', { state: { sessionId: res.data.id, questions: sessionQuestions, setup } });
    } catch (error) {
      toast.error('Failed to save session.');
    }
  };

  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const evaluation = evaluations[currentIndex];

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
    <div>
      {/* Header & Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3]">
            {setup.company || 'General'} Interview
          </h1>
          <span className="text-sm font-medium text-[#8B8994] dark:text-[#75727F]">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-[#E7E4DC] dark:bg-[#2C2A35] rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#4338CA] to-[#6D5EF0] h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-[#E7E4DC] p-6 rounded-xl shadow-sm mb-6 dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-[#EDEBFB] text-[#4338CA] rounded-full text-xs font-semibold dark:bg-[#2A2740] dark:text-[#A79CF5]">
            {currentQuestion.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyStyles[currentQuestion.difficulty] || difficultyStyles.Easy}`}>
            {currentQuestion.difficulty}
          </span>
          {currentQuestion.topic && (
            <span className="px-3 py-1 rounded-full text-xs bg-[#F1EFEA] text-[#5B5964] dark:bg-white/[0.06] dark:text-[#B3B0BC]">
              {currentQuestion.topic}
            </span>
          )}
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-[#1C1B22] dark:text-[#EDEBF3] leading-snug">
          {currentQuestion.question}
        </h2>
        {currentQuestion.hint && (
          <p className="mt-3.5 flex items-start gap-1.5 text-sm text-[#8B8994] dark:text-[#9A97A6] italic">
            <Icon.Lightbulb className="h-4 w-4 mt-0.5 shrink-0 not-italic" />
            <span>Hint: {currentQuestion.hint}</span>
          </p>
        )}
      </div>

      {/* Answer Area */}
      <div className="bg-white border border-[#E7E4DC] p-6 rounded-xl shadow-sm mb-6 dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
        <label className="flex items-center gap-1.5 text-sm font-medium text-[#5B5964] dark:text-[#A6A4B0] mb-2">
          <Icon.MessageSquare className="h-3.5 w-3.5" />
          Your Answer
        </label>
        <textarea
          value={answers[currentIndex] || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
          disabled={showFeedback}
          rows={8}
          className="w-full px-4 py-3 rounded-lg border border-[#E7E4DC] bg-white text-[#1C1B22] placeholder-[#8B8994] focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] focus:outline-none disabled:bg-[#F6F5F1] disabled:text-[#8B8994] transition-colors
            dark:bg-[#121218] dark:border-[#3D3A48] dark:text-[#EDEBF3] dark:placeholder-[#75727F] dark:focus:ring-[#6D5EF0]/30 dark:focus:border-[#6D5EF0] dark:disabled:bg-[#17161C] dark:disabled:text-[#75727F]"
          placeholder="Type your answer here. Be specific and structured..."
        />

        {!showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !answers[currentIndex]?.trim()}
            className="mt-4 w-full py-3 rounded-lg font-semibold text-white transition-all
              bg-gradient-to-br from-[#4338CA] to-[#332C9E] hover:shadow-lg hover:-translate-y-0.5
              disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none
              dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.4)] dark:hover:shadow-[0_0_32px_-6px_rgba(109,94,240,0.55)]
              flex items-center justify-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Icon.Spinner className="h-5 w-5" />
                AI is evaluating...
              </>
            ) : (
              'Submit Answer'
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="mt-4 w-full py-3 rounded-lg font-semibold text-white transition-all
              bg-gradient-to-br from-[#4338CA] to-[#332C9E] hover:shadow-lg hover:-translate-y-0.5
              dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.4)] dark:hover:shadow-[0_0_32px_-6px_rgba(109,94,240,0.55)]
              flex items-center justify-center gap-2"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <Icon.ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Finish Interview
                <Icon.Flag className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Feedback Area (Conditional) */}
      {showFeedback && evaluation && (
        <div className="space-y-4 animate-fade-in">
          {/* Score */}
          <div className="bg-white border border-[#E7E4DC] p-6 rounded-xl shadow-sm text-center dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Icon.Gauge className="h-4 w-4 text-[#8B8994] dark:text-[#75727F]" />
              <h3 className="text-sm font-semibold text-[#5B5964] dark:text-[#A6A4B0] uppercase tracking-wide">Score</h3>
            </div>
            <div className={`text-5xl font-bold ${scoreColor(evaluation.overall_score)}`}>
              {evaluation.overall_score}<span className="text-2xl text-[#8B8994] dark:text-[#75727F]">/100</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              {Object.entries(evaluation.scores).map(([key, val]) => (
                <div key={key} className="bg-[#F6F5F1] dark:bg-[#121218] p-2.5 rounded-lg dark:border dark:border-[#2C2A35]">
                  <p className="text-xs text-[#8B8994] dark:text-[#75727F] capitalize">{key}</p>
                  <p className="font-bold text-[#1C1B22] dark:text-[#EDEBF3] mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Improved Answer */}
          <div className="bg-white border border-[#E7E4DC] p-6 rounded-xl shadow-sm dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
            <h3 className="text-base font-semibold mb-2 text-[#1C1B22] dark:text-[#EDEBF3]">Feedback</h3>
            <p className="text-[#5B5964] dark:text-[#A6A4B0] mb-5 leading-relaxed">{evaluation.feedback}</p>

            <h3 className="flex items-center gap-1.5 text-base font-semibold mb-2 text-[#1E7A34] dark:text-[#7FD99A]">
              <Icon.Sparkle className="h-4 w-4" />
              Model Answer
            </h3>
            <div className="bg-[#E9F6EC] p-4 rounded-lg border border-[#CDEBD4] text-[#1C1B22] whitespace-pre-wrap leading-relaxed
              dark:bg-[#173A20]/40 dark:border-[#2A5A38] dark:text-[#D6F0DC]">
              {evaluation.improved_answer}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
