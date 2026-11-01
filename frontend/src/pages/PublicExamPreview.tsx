import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PublicQuestionResponse } from '../types/question';
import { ArrowLeft, ShieldCheck, Eye, RefreshCw, AlertTriangle } from 'lucide-react';

export const PublicExamPreview: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [questions, setQuestions] = useState<PublicQuestionResponse[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicQuestions = async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPublicQuestions(examId);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch public questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicQuestions();
  }, [examId]);

  const handleSelect = (questionId: string, optionId: string, isMulti: boolean) => {
    if (isMulti) {
      const current = (selectedAnswers[questionId] as string[]) || [];
      if (current.includes(optionId)) {
        setSelectedAnswers({ ...selectedAnswers, [questionId]: current.filter(id => id !== optionId) });
      } else {
        setSelectedAnswers({ ...selectedAnswers, [questionId]: [...current, optionId] });
      }
    } else {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId });
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Security Banner */}
      <div className="glass-panel" style={{ 
        padding: '16px 20px', 
        borderColor: 'rgba(34, 197, 94, 0.3)', 
        background: 'rgba(34, 197, 94, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <ShieldCheck size={28} color="#4ade80" />
        <div>
          <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.95rem' }}>
            Anti-Cheat Student Endpoint Verified (`/api/v1/public/exams/{'{examId}'}/questions`)
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Correct answers (`isCorrect`) and solution explanations are completely stripped from the response payload.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div>Loading student test view...</div>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: 24, color: '#f87171' }}>
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: 48 }}>
          <AlertTriangle size={36} color="#eab308" style={{ marginBottom: 12 }} />
          <h3>No Questions Available for this Exam</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {questions.map((q, idx) => {
            const isMulti = q.questionType === 'MULTIPLE_CHOICE';
            const selected = selectedAnswers[q.id];

            return (
              <div key={q.id} className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#94a3b8' }}>
                    Question {idx + 1} of {questions.length}
                  </span>
                  <span className="badge badge-blue">
                    {q.points} {q.points === 1 ? 'pt' : 'pts'}
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 18, color: '#f8fafc' }}>
                  {q.questionText}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options?.map((opt) => {
                    const isChecked = isMulti 
                      ? Array.isArray(selected) && selected.includes(opt.id)
                      : selected === opt.id;

                    return (
                      <div 
                        key={opt.id}
                        onClick={() => handleSelect(q.id, opt.id, isMulti)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          background: isChecked ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isChecked ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input 
                          type={isMulti ? 'checkbox' : 'radio'}
                          name={`q_${q.id}`}
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          style={{ accentColor: '#6366f1', width: 16, height: 16 }}
                        />
                        <span style={{ color: isChecked ? '#e0e7ff' : '#cbd5e1', fontWeight: isChecked ? 600 : 400 }}>
                          {opt.optionText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
