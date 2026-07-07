import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import QueryPage from './pages/dashboard/QueryPage';
import GeneratePage from './pages/dashboard/GeneratePage';
import PracticePage from './pages/dashboard/PracticePage';
import StatsPage from './pages/dashboard/StatsPage';
import HistoryPage from './pages/dashboard/HistoryPage';
import RoadmapPage from './pages/dashboard/RoadmapPage';
import InterviewSetupPage from './pages/dashboard/InterviewSetupPage';
import InterviewSessionPage from './pages/dashboard/InterviewSessionPage';
import ResultsPage from './pages/dashboard/ResultsPage';

// ... imports
import { useState, useEffect } from 'react';
import API from './services/api';

function ProtectedRoute({ children }) {
  const { user, loading, setUser } = useAuth();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      if (token && !user) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setVerifying(false);
    };
    verifyToken();
  }, []);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/query" element={<ProtectedRoute><QueryPage /></ProtectedRoute>} />
      <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><InterviewSetupPage /></ProtectedRoute>} />
      <Route path="/session" element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;