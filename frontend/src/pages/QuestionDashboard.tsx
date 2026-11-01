import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getStoredUserEmail } from '../services/api';
import { QuestionResponse } from '../types/question';
import { 
  Plus, 
  HelpCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Key, 
  Layers, 
  Award, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const QuestionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [examId, setExamId] = useState<string>('e1e1e1e1-1111-1111-1111-111111111111');
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's exams from MS2 if possible
  useEffect(() => {
    api.getExams()
      .then((res) => {
        const examsList = res.content || res.exams || res;
        if (Array.isArray(examsList) && examsList.length > 0) {
          setAvailableExams(examsList);
          if (!examId || examId === 'e1e1e1e1-1111-1111-1111-111111111111') {
            setExamId(examsList[0].id);
          }
        }
      })
      .catch((err) => console.log('Could not load exams from MS2, using custom ID:', err));
  }, []);

  const loadQuestions = async (idToLoad = examId) => {
    if (!idToLoad.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getQuestionsForExam(idToLoad.trim());
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) {
      loadQuestions(examId);
    }
  }, [examId]);

  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header / Exam selector */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: 8 }}>Microservice 3 (MS3)</span>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Question Bank Manager</h2>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
              Creator: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{getStoredUserEmail()}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to={`/exam/${examId}/preview`} className="btn btn-secondary btn-sm">
              <Eye size={16} />
              Student View (Public)
            </Link>
            <Link to={`/exam/${examId}/answer-key`} className="btn btn-secondary btn-sm">
              <Key size={16} />
              Answer Key (MS4)
            </Link>
            <Link to={`/exam/${examId}/questions/new`} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Add Question
            </Link>
          </div>
        </div>

        {/* Exam ID Selector */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>Target Exam UUID:</span>
            
            {availableExams.length > 0 && (
              <select 
                className="form-select" 
                style={{ width: 'auto', minWidth: 220 }}
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              >
                {availableExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.id.substring(0, 8)}...)
                  </option>
                ))}
              </select>
            )}

            <input 
              type="text" 
              className="form-input" 
              style={{ width: 'auto', minWidth: 320, flex: 1 }}
              placeholder="Or enter exam UUID manually"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            />

            <button 
              className="btn btn-secondary" 
              onClick={() => loadQuestions(examId)}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Reload
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="glass-card flex items-center gap-4">
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Questions</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{questions.length}</div>
          </div>
        </div>

        <div className="glass-card flex items-center gap-4">
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Exam Points</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{totalPoints} pts</div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="glass-panel" style={{ padding: 16, borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div>Loading questions...</div>
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: 48 }}>
          <HelpCircle size={44} color="#6366f1" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>No Questions Found for this Exam</h3>
          <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Create your first question to populate this exam.
          </p>
          <Link to={`/exam/${examId}/questions/new`} className="btn btn-primary">
            <Plus size={18} />
            Create First Question
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-panel" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {idx + 1}
                  </span>
                  <span className={`badge ${q.questionType === 'SINGLE_CHOICE' ? 'badge-blue' : q.questionType === 'MULTIPLE_CHOICE' ? 'badge-purple' : 'badge-green'}`}>
                    {q.questionType.replace('_', ' ')}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                    {q.points} {q.points === 1 ? 'pt' : 'pts'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => navigate(`/questions/edit/${q.id}`, { state: { question: q, examId } })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit3 size={15} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginBottom: 16 }}>
                {q.questionText}
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                {q.options?.map((opt) => (
                  <div 
                    key={opt.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: opt.isCorrect ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${opt.isCorrect ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.9rem'
                    }}
                  >
                    {opt.isCorrect ? (
                      <CheckCircle2 size={16} color="#4ade80" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                    )}
                    <span style={{ color: opt.isCorrect ? '#86efac' : '#cbd5e1', fontWeight: opt.isCorrect ? 600 : 400 }}>
                      {opt.optionText}
                    </span>
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#cbd5e1' }}>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
