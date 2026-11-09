import React, { useState } from 'react';
import { 
  getQuestionApiBase, 
  setQuestionApiBase, 
  getExamApiBase, 
  getAuthApiBase, 
  api 
} from '../services/api';
import { Settings, Check, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [questionUrl, setQuestionUrl] = useState(getQuestionApiBase());
  const [examUrl, setExamUrl] = useState(getExamApiBase());
  const [authUrl, setAuthUrl] = useState(getAuthApiBase());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setQuestionApiBase(questionUrl);
    localStorage.setItem('exam_api_base', examUrl.trim());
    localStorage.setItem('auth_api_base', authUrl.trim());
    window.location.reload();
  };

  const handleTestPing = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await api.checkHealth(questionUrl);
      setTestResult({ success: true, msg: 'Backend is awake and responding! (HTTP 200 OK)' });
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || 'Cannot reach backend yet.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 540, padding: 28, background: '#111827' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={20} color="#818cf8" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Microservice API Endpoints</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        {testResult && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            background: testResult.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: testResult.success ? '#4ade80' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.85rem'
          }}>
            {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{testResult.msg}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            MS3 Question Service URL (Render Backend)
          </label>
          <input 
            type="text" 
            className="form-input" 
            value={questionUrl}
            onChange={(e) => setQuestionUrl(e.target.value)}
            placeholder="https://your-ms3-service.onrender.com/api/v1"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
            <span>Include trailing /api/v1</span>
            <button 
              type="button" 
              onClick={handleTestPing} 
              disabled={testing}
              style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {testing ? 'Pinging...' : 'Test / Ping Backend'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            MS2 Exam Service URL
          </label>
          <input 
            type="text" 
            className="form-input" 
            value={examUrl}
            onChange={(e) => setExamUrl(e.target.value)}
            placeholder="https://ms2-w51n.onrender.com/api/v1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            MS1 Auth Service URL
          </label>
          <input 
            type="text" 
            className="form-input" 
            value={authUrl}
            onChange={(e) => setAuthUrl(e.target.value)}
            placeholder="https://microservice-based-examination-1.onrender.com/api/v1/auth"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-sm">
            <Check size={16} />
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

