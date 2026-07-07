import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

/* Line-icon set — one consistent stroke style instead of mixed emoji */
const Icon = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  Target: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  Map: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  ),
  Logout: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Sun: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  ),
  Moon: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  ),
};

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Icon.Home },
  { path: '/setup', label: 'Start Interview', icon: Icon.Target, primary: true },
  { path: '/stats', label: 'Dashboard', icon: Icon.Chart },
  { path: '/history', label: 'History', icon: Icon.Clock },
  { path: '/roadmap', label: 'Roadmap', icon: Icon.Map },
  { path: '/query', label: 'Ask AI', icon: Icon.Search },
];

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#121218';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#F6F5F1';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#1C1B22] dark:bg-[#121218] dark:text-[#EDEBF3] transition-colors">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E7E4DC] dark:bg-[#1A1A22]/90 dark:border-[#2C2A35] transition-colors">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6D5EF0] text-white text-sm font-semibold tracking-tight">
              IA
            </span>
            <span className="text-lg font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3]">
              InterviewAI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pl-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDEBFB] text-[#4338CA] text-xs font-semibold dark:bg-[#2A2740] dark:text-[#A79CF5]">
                {initials(user?.full_name)}
              </span>
              <span className="text-sm text-[#5B5964] dark:text-[#A6A4B0]">{user?.email}</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center h-9 w-9 rounded-lg text-[#5B5964] hover:text-[#4338CA] hover:bg-[#EFEDE6] dark:text-[#A6A4B0] dark:hover:text-[#A79CF5] dark:hover:bg-[#22202C] transition-colors"
            >
              {theme === 'dark' ? <Icon.Sun className="h-[18px] w-[18px]" /> : <Icon.Moon className="h-[18px] w-[18px]" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#5B5964] hover:text-[#B3261E] hover:bg-[#FBEAE9] dark:text-[#A6A4B0] dark:hover:text-[#F87171] dark:hover:bg-[#2A1D1D] transition-colors"
            >
              <Icon.Logout className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 min-h-[calc(100vh-57px)] border-r border-[#E7E4DC] dark:border-[#2C2A35] hidden lg:block transition-colors">
          <div className="p-5 sticky top-[73px]">
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#4338CA] to-[#332C9E] text-white dark:from-[#2A2565] dark:to-[#1A1740] dark:border dark:border-[#3D3880] dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.35)]">
              <p className="text-xs uppercase tracking-wider text-white/70 font-medium dark:text-[#A79CF5]/80">
                Welcome back
              </p>
              <p className="mt-1 font-semibold text-lg leading-tight">
                {user?.full_name}
              </p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]'
                        : item.primary
                        ? 'text-[#B45309] hover:bg-[#FEF3E2] dark:text-[#F0B268] dark:hover:bg-[#2E2717]'
                        : 'text-[#5B5964] hover:bg-[#EFEDE6] hover:text-[#1C1B22] dark:text-[#A6A4B0] dark:hover:bg-[#1F1E27] dark:hover:text-[#EDEBF3]'
                      }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#4338CA] dark:bg-[#A79CF5]" />
                    )}
                    <ItemIcon className={`h-[18px] w-[18px] ${item.primary && !active ? 'text-[#D97706] dark:text-[#F0B268]' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#E7E4DC] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:bg-[#1A1A22]/95 dark:border-[#2C2A35] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] z-50 transition-colors">
          <div className="flex justify-around py-1.5">
            {navItems.slice(0, 5).map((item) => {
              const active = location.pathname === item.path;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors
                      ${active ? 'bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]' : 'text-[#8B8994] dark:text-[#75727F]'}`}
                  >
                    <ItemIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span className={active ? 'text-[#4338CA] dark:text-[#A79CF5]' : 'text-[#8B8994] dark:text-[#75727F]'}>
                    {item.label.split(' ')[0]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {isHome ? (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-semibold tracking-tight text-[#1C1B22] dark:text-[#EDEBF3]">
                  Welcome, {user?.full_name?.split(' ')[0] || 'there'}
                </h2>
                <p className="mt-1 text-sm text-[#5B5964] dark:text-[#A6A4B0]">
                  Pick up where you left off, or start a fresh mock interview.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {navItems.filter((n) => n.path !== '/dashboard').map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative overflow-hidden p-5 rounded-xl border transition-all group
                        ${item.primary
                          ? 'bg-gradient-to-br from-[#4338CA] to-[#332C9E] border-transparent text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 dark:from-[#2A2565] dark:to-[#1A1740] dark:border dark:border-[#3D3880] dark:shadow-[0_0_24px_-8px_rgba(109,94,240,0.35)] dark:hover:shadow-[0_0_32px_-8px_rgba(109,94,240,0.45)]'
                          : 'bg-white border-[#E7E4DC] hover:border-[#C9C6BC] hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1A1A22] dark:border-[#2C2A35] dark:hover:border-[#3D3A48] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                        }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg mb-4
                          ${item.primary ? 'bg-white/15' : 'bg-[#EDEBFB] text-[#4338CA] dark:bg-[#2A2740] dark:text-[#A79CF5]'}`}
                      >
                        <ItemIcon className="h-5 w-5" />
                      </div>
                      <h3 className={`font-semibold text-base ${item.primary ? 'text-white' : 'text-[#1C1B22] dark:text-[#EDEBF3]'}`}>
                        {item.label}
                      </h3>
                      <div
                        className={`mt-3 inline-flex items-center gap-1 text-xs font-medium
                          ${item.primary ? 'text-white/80' : 'text-[#8B8994] group-hover:text-[#4338CA] dark:text-[#75727F] dark:group-hover:text-[#A79CF5]'}`}
                      >
                        Open
                        <Icon.Chevron className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}