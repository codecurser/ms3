import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ExamAnswerKeyResponse } from '../types/question';
import { ArrowLeft, Key, Code, CheckCircle2, RefreshCw } from 'lucide-react';

export const AnswerKeyView: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [data, setData] = useState<ExamAnswerKeyResponse | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKey = async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnswerKey(examId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load answer key');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKey();
  }, [examId]);

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <button 
          onClick={() => setShowJson(!showJson)}
          className="btn btn-secondary btn-sm"
        >
          <Code size={16} />
          {showJson ? 'Show Formatted View' : 'Show Raw JSON (MS4)'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 10, borderRadius: 10, background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <Key size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Evaluation Service Answer Key</h2>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Endpoint: <code>/api/v1/internal/exams/{'{examId}'}/answer-key</code></div>
          </div>
        </div>

        {data && (
          <div style={{ display: 'flex', gap: 24, marginTop: 12, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Questions: </span>
              <strong style={{ color: '#f8fafc' }}>{data.totalQuestions}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Points: </span>
              <strong style={{ color: '#4ade80' }}>{data.totalPoints} pts</strong>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div>Loading answer key...</div>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: 20, color: '#f87171' }}>
          {error}
        </div>
      ) : showJson ? (
        <pre className="glass-panel" style={{ padding: 20, overflowX: 'auto', fontSize: '0.85rem', color: '#38bdf8' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data?.questions.map((item, idx) => (
            <div key={item.questionId} className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700 }}>#{idx + 1}</span>
                  <span className="badge badge-purple">{item.questionType}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{item.points} pts</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Correct Option IDs:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {item.correctOptionIds.map(id => (
                    <code key={id} style={{ 
                      background: 'rgba(34, 197, 94, 0.15)', 
                      color: '#4ade80', 
                      padding: '4px 8px', 
                      borderRadius: 6,
                      fontSize: '0.8rem' 
                    }}>
                      {id}
                    </code>
                  ))}
                </div>
              </div>

              {item.correctOptions && item.correctOptions.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Correct Answer Text:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                    {item.correctOptions.map(opt => (
                      <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="#4ade80" />
                        <span>{opt.optionText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.explanation && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <strong>Explanation:</strong> {item.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

