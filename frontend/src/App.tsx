import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { getAuthToken, removeAuthToken, getQuestionApiBase } from './services/api';
import { Login } from './pages/Login';
import { QuestionDashboard } from './pages/QuestionDashboard';
import { QuestionEditor } from './pages/QuestionEditor';
import { PublicExamPreview } from './pages/PublicExamPreview';
import { AnswerKeyView } from './pages/AnswerKeyView';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { LogOut, Settings } from 'lucide-react';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAuthToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export function App() {
  const token = getAuthToken();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const currentBase = getQuestionApiBase();
  const isLocalOnHttps = window.location.protocol === 'https:' && currentBase.includes('localhost');

  const handleLogout = () => {
    removeAuthToken();
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Warning if HTTPS Vercel frontend is targeting HTTP localhost */}
        {isLocalOnHttps && (
          <div style={{
            background: 'linear-gradient(90deg, #b45309, #d97706)',
            color: 'white',
            padding: '8px 16px',
            fontSize: '0.85rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}>
            <span>⚠️ Frontend is on HTTPS, but currently targeting <code>{currentBase}</code>.</span>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              style={{
                background: 'white',
                color: '#92400e',
                border: 'none',
                borderRadius: 4,
                padding: '2px 8px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Set Render Backend URL
            </button>
          </div>
        )}

        <header className="app-header">
          <div className="container flex items-center justify-between">
            <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800
              }}>
                Q
              </div>
              <span className="text-gradient" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Question Portal (MS3)
              </span>
            </Link>

            <div className="nav-links">
              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="btn btn-secondary btn-sm"
                title="Configure Backend URLs"
              >
                <Settings size={14} />
                API URL
              </button>

              {token ? (
                <>
                  <Link to="/dashboard" className="nav-item">Questions</Link>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                    <LogOut size={15} />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="container app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Public Student Test View (No Auth) */}
            <Route path="/exam/:examId/preview" element={<PublicExamPreview />} />

            {/* Internal Answer Key View (No Auth / Internal) */}
            <Route path="/exam/:examId/answer-key" element={<AnswerKeyView />} />

            {/* Creator Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <QuestionDashboard />
              </ProtectedRoute>
            } />

            <Route path="/exam/:examId/questions/new" element={
              <ProtectedRoute>
                <QuestionEditor />
              </ProtectedRoute>
            } />

            <Route path="/questions/edit/:questionId" element={
              <ProtectedRoute>
                <QuestionEditor />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <ApiSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
