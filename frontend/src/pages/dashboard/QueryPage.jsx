import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

/* Same line-icon style as the rest of the app — consistent stroke set, no emoji */
const Icon = {
  Bot: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="8.5" width="16" height="11" rx="3" />
      <path d="M12 8.5V5M9 5h6" />
      <circle cx="9" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  MessageSquare: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4.5h16v11H8.5L4 19.5v-15Z" />
    </svg>
  ),
  Tag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11.5 3.5H5a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l6.5-6.5a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.7-.3Z" />
      <circle cx="8.5" cy="8.5" r="1.25" />
    </svg>
  ),
  Copy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1h2.5" />
    </svg>
  ),
  BookOpen: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 6.5c-1.5-1.3-3.6-2-6.5-2v13c2.9 0 5 .7 6.5 2 1.5-1.3 3.6-2 6.5-2v-13c-2.9 0-5 .7-6.5 2Z" />
      <path d="M12 6.5v13" />
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

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [categories, setCategories] = useState(["all"]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "dsa", label: "DSA" },
    { value: "hr", label: "HR" },
    { value: "behavioral", label: "Behavioral" },
    { value: "system_design", label: "System Design" },
  ];

  const handleCategoryToggle = (value) => {
    if (value === "all") {
      setCategories(["all"]);
      return;
    }

    const selected = categories.filter((c) => c !== "all");

    if (selected.includes(value)) {
      const updated = selected.filter((c) => c !== value);
      setCategories(updated.length ? updated : ["all"]);
    } else {
      setCategories([...selected, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    setIsLoading(true);

    try {
      const res = await API.post("/query/ask", {
        question,
        categories,
        n_results: 5,
        max_tokens: 1024,
        temperature: 0.3,
      });

      setResult(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Query failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnswer = () => {
    navigator.clipboard.writeText(result?.answer || "");
    toast.success("Answer copied!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
    <div>

      {/* Header */}
      <div className="rounded-xl p-6 md:p-8 text-white mb-8
        bg-gradient-to-br from-[#4338CA] to-[#332C9E]
        dark:from-[#2A2565] dark:to-[#1A1740] dark:border dark:border-[#3D3880] dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.35)]">
        <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-semibold tracking-tight">
          <Icon.Bot className="h-7 w-7" />
          AI Interview Assistant
        </h1>
        <p className="mt-2 text-white/80 dark:text-[#A79CF5]/80">
          Ask interview questions and get AI-powered answers instantly.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E7E4DC] rounded-xl shadow-sm p-6 md:p-8 space-y-6 dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors"
      >
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-2">
            <Icon.MessageSquare className="h-4 w-4" />
            Your Question
          </label>

          <textarea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Explain Binary Search with Java..."
            className="w-full rounded-xl border border-[#E7E4DC] bg-white text-[#1C1B22] placeholder-[#8B8994] p-4 resize-none outline-none focus:ring-4 focus:ring-[#4338CA]/15 focus:border-[#4338CA] transition-colors
              dark:bg-[#121218] dark:border-[#3D3A48] dark:text-[#EDEBF3] dark:placeholder-[#75727F] dark:focus:ring-[#6D5EF0]/20 dark:focus:border-[#6D5EF0]"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-3">
            <Icon.Tag className="h-4 w-4" />
            Categories
          </label>

          <div className="flex flex-wrap gap-2.5">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleCategoryToggle(opt.value)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors
                  ${categories.includes(opt.value)
                    ? "bg-[#4338CA] text-white dark:bg-[#6D5EF0]"
                    : "bg-[#F1EFEA] text-[#5B5964] hover:bg-[#E7E4DC] dark:bg-white/[0.06] dark:text-[#B3B0BC] dark:hover:bg-white/[0.1]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all
            bg-gradient-to-br from-[#4338CA] to-[#332C9E] hover:shadow-lg hover:-translate-y-0.5
            disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none
            dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.4)] dark:hover:shadow-[0_0_32px_-6px_rgba(109,94,240,0.55)]
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Icon.Spinner className="h-5 w-5" />
              AI is thinking...
            </>
          ) : (
            <>
              <Icon.Sparkle className="h-5 w-5" />
              Ask AI
            </>
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 space-y-6">

          {/* AI Answer */}
          <div className="bg-white border border-[#E7E4DC] rounded-xl shadow-sm overflow-hidden dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
            <div className="flex justify-between items-center px-6 py-4
              bg-gradient-to-r from-[#4338CA] to-[#332C9E]
              dark:from-[#2A2565] dark:to-[#1A1740] dark:border-b dark:border-[#3D3880]">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Icon.Bot className="h-5 w-5" />
                AI Answer
              </h2>

              <button
                onClick={copyAnswer}
                className="flex items-center gap-1.5 bg-white/95 text-[#332C9E] px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-white transition-colors
                  dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                <Icon.Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>

            <div className="p-6">
              <div className="whitespace-pre-wrap leading-8 text-[#1C1B22] dark:text-[#EDEBF3]">
                {result.answer}
              </div>
            </div>
          </div>

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div className="bg-white border border-[#E7E4DC] rounded-xl shadow-sm p-6 dark:bg-[#1C1B24] dark:border-[#33313D] transition-colors">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1C1B22] dark:text-[#EDEBF3] mb-5">
                <Icon.BookOpen className="h-5 w-5 text-[#4338CA] dark:text-[#A79CF5]" />
                Related Sources
              </h2>

              <div className="space-y-4">
                {result.sources.map((source, index) => {
                  const pct = Math.round((source.relevance_score || 0) * 100);
                  return (
                    <div
                      key={index}
                      className="border border-[#E7E4DC] rounded-xl p-4 hover:bg-[#F6F5F1] transition-colors
                        dark:border-[#33313D] dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div>
                          <span className="bg-[#EDEBFB] text-[#4338CA] text-xs px-3 py-1 rounded-full dark:bg-[#2A2740] dark:text-[#A79CF5]">
                            {source.category}
                          </span>
                          <h3 className="mt-2 font-semibold text-[#1C1B22] dark:text-[#EDEBF3]">
                            {source.topic}
                          </h3>
                        </div>

                        <span className="font-semibold text-[#4338CA] dark:text-[#A79CF5] whitespace-nowrap">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-[#E7E4DC] dark:bg-[#2C2A35] rounded-full h-2 mt-4">
                        <div
                          className="bg-[#4338CA] dark:bg-[#6D5EF0] h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
    </div>
  );
}