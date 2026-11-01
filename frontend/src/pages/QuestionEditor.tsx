import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { QuestionType, OptionRequest } from '../types/question';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Save, AlertCircle } from 'lucide-react';

export const QuestionEditor: React.FC = () => {
  const navigate = useNavigate();
  const { examId: routeExamId, questionId } = useParams();
  const location = useLocation();

  const isEditing = Boolean(questionId);
  const initialExamId = routeExamId || location.state?.examId || 'e1e1e1e1-1111-1111-1111-111111111111';

  const [examId, setExamId] = useState(initialExamId);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('SINGLE_CHOICE');
  const [points, setPoints] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<OptionRequest[]>([
    { optionText: '', isCorrect: true, orderIndex: 0 },
    { optionText: '', isCorrect: false, orderIndex: 1 },
    { optionText: '', isCorrect: false, orderIndex: 2 },
    { optionText: '', isCorrect: false, orderIndex: 3 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If editing, load question details
  useEffect(() => {
    if (isEditing && questionId) {
      if (location.state?.question) {
        const q = location.state.question;
        setQuestionText(q.questionText);
        setQuestionType(q.questionType);
        setPoints(q.points);
        setExplanation(q.explanation || '');
        setExamId(q.examId);
        setOptions(q.options.map((o: any) => ({
          id: o.id,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          orderIndex: o.orderIndex
        })));
      } else {
        setLoading(true);
        api.getQuestionById(questionId)
          .then((q) => {
            setQuestionText(q.questionText);
            setQuestionType(q.questionType);
            setPoints(q.points);
            setExplanation(q.explanation || '');
            setExamId(q.examId);
            setOptions(q.options.map(o => ({
              id: o.id,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
              orderIndex: o.orderIndex
            })));
          })
          .catch((err) => setError(err.message || 'Failed to load question'))
          .finally(() => setLoading(false));
      }
    }
  }, [isEditing, questionId]);

  // Adjust options template when question type changes
  const handleTypeChange = (newType: QuestionType) => {
    setQuestionType(newType);
    if (newType === 'TRUE_FALSE') {
      setOptions([
        { optionText: 'True', isCorrect: true, orderIndex: 0 },
        { optionText: 'False', isCorrect: false, orderIndex: 1 }
      ]);
    } else if (options.length < 2) {
      setOptions([
        { optionText: '', isCorrect: true, orderIndex: 0 },
        { optionText: '', isCorrect: false, orderIndex: 1 }
      ]);
    }
  };

  const handleOptionCorrectToggle = (index: number) => {
    if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
      setOptions(options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      })));
    } else {
      // MULTIPLE_CHOICE
      setOptions(options.map((opt, i) => i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt));
    }
  };

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions(options.map((opt, i) => i === index ? { ...opt, optionText: text } : opt));
  };

  const addOption = () => {
    setOptions([...options, { optionText: '', isCorrect: false, orderIndex: options.length }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('A question must have at least 2 options.');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    const emptyOption = options.some(o => !o.optionText.trim());
    if (emptyOption) {
      setError('All options must have text.');
      return;
    }

    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount === 0) {
      setError('At least one option must be marked as correct.');
      return;
    }
    if ((questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') && correctCount !== 1) {
      setError(`${questionType} questions must have exactly 1 correct option.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        questionText: questionText.trim(),
        questionType,
        points: Number(points),
        explanation: explanation.trim() || undefined,
        options: options.map((opt, idx) => ({
          id: opt.id,
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          orderIndex: idx
        }))
      };

      if (isEditing && questionId) {
        await api.updateQuestion(questionId, payload);
      } else {
        await api.createQuestion(examId, payload);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          Back to Questions
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: 32 }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 800 }}>
          {isEditing ? 'Edit Question' : 'Create New Question'}
        </h2>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Question Text */}
          <div className="form-group">
            <label className="form-label">Question Text *</label>
            <textarea 
              className="form-textarea" 
              placeholder="What is the time complexity of binary search?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Type & Points Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Question Type *</label>
              <select 
                className="form-select"
                value={questionType}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              >
                <option value="SINGLE_CHOICE">Single Choice (1 Correct)</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Multiple Correct)</option>
                <option value="TRUE_FALSE">True / False</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Points *</label>
              <input 
                type="number" 
                className="form-input" 
                min={1} 
                max={100}
                value={points}
                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
                required
              />
            </div>
          </div>

          {/* Options Section */}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="form-label" style={{ margin: 0 }}>
                Answer Options & Correct Answer *
              </label>
              {questionType !== 'TRUE_FALSE' && (
                <button type="button" onClick={addOption} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Option
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: opt.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${opt.isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                  }}
                >
                  <input 
                    type={questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => handleOptionCorrectToggle(idx)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#22c55e' }}
                    title="Mark as correct answer"
                  />

                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1, padding: '8px 12px' }}
                    placeholder={`Option ${idx + 1}`}
                    value={opt.optionText}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    required
                  />

                  {questionType !== 'TRUE_FALSE' && (
                    <button 
                      type="button" 
                      onClick={() => removeOption(idx)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: 6 }}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: 8 }}>
              Click the checkbox/radio button to mark the correct answer.
            </span>
          </div>

          {/* Explanation */}
          <div className="form-group">
            <label className="form-label">Explanation (Optional - shown in answer key and post-exam review)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Binary search operates by halving the search space, resulting in O(log n) time."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : (isEditing ? 'Update Question' : 'Save Question')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

