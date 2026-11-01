import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAuthToken, setStoredUserEmail } from '../services/api';
import { LogIn, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useTokenDirectly, setUseTokenDirectly] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (useTokenDirectly) {
        if (!manualToken.trim()) {
          throw new Error('Please enter a valid JWT token');
        }
        setAuthToken(manualToken.trim());
        setStoredUserEmail('creator@examportal.com');
        navigate('/dashboard');
        return;
      }

      const res = await api.login({ email, password });
      const token = res.accessToken || res.token;
      if (token) {
        setAuthToken(token);
        setStoredUserEmail(email);
        navigate('/dashboard');
      } else {
        throw new Error('No access token received from auth service');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or paste token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '60px auto' }}>
      <div className="glass-panel" style={{ padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ 
            width: 52, 
            height: 52, 
            borderRadius: 14, 
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <KeyRound size={26} color="white" />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: 800 }}>Question Portal Login</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Authenticate with MS1 (auth-service) to manage exam questions
          </p>
        </div>

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

        <form onSubmit={handleLogin}>
          {!useTokenDirectly ? (
            <>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="creator@examportal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!useTokenDirectly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!useTokenDirectly}
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Paste JWT Bearer Token directly</label>
              <textarea 
                className="form-textarea" 
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                rows={4}
                required={useTokenDirectly}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : (useTokenDirectly ? 'Continue with Token' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button 
            type="button" 
            className="btn btn-sm btn-secondary"
            onClick={() => setUseTokenDirectly(!useTokenDirectly)}
          >
            {useTokenDirectly ? 'Switch to Email / Password' : 'Or paste JWT Token directly'}
          </button>
        </div>
      </div>
    </div>
  );
};

