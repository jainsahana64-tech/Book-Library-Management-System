import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLoginTab && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        await onLogin({ email: email.trim(), password });
      } else {
        await onSignup({ name: name.trim(), email: email.trim(), password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant testing
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // First try logging in with demo credentials, or sign up if not yet created
      try {
        await onLogin({ email: 'librarian@glowlogic.com', password: 'password123' });
      } catch {
        // If login failed, auto-register the demo user
        await onSignup({
          name: 'Demo Librarian',
          email: 'librarian@glowlogic.com',
          password: 'password123',
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isLoginTab ? <LogIn size={22} color="#6366f1" /> : <UserPlus size={22} color="#6366f1" />}
            <h2 className="modal-title">{isLoginTab ? 'Welcome Back' : 'Create an Account'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(0,0,0,0.25)',
          padding: '0.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            type="button"
            className={`status-tab ${isLoginTab ? 'active' : ''}`}
            onClick={() => { setIsLoginTab(true); setError(''); }}
            id="tab-login"
            style={{ width: '100%', textAlign: 'center' }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`status-tab ${!isLoginTab ? 'active' : ''}`}
            onClick={() => { setIsLoginTab(false); setError(''); }}
            id="tab-signup"
            style={{ width: '100%', textAlign: 'center' }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name-input">Full Name</label>
              <input
                id="auth-name-input"
                type="text"
                className="form-input"
                placeholder="e.g. Sahana Jain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLoginTab}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email-input">Email Address</label>
            <input
              id="auth-email-input"
              type="email"
              className="form-input"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password-input">Password</label>
            <input
              id="auth-password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            id="btn-auth-submit"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLoginTab ? 'Sign In to Library' : 'Create Account'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.25rem 0',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Demo Login Button */}
        <button
          type="button"
          className="btn btn-secondary"
          id="btn-demo-login"
          onClick={handleDemoLogin}
          style={{ width: '100%', gap: '0.5rem' }}
          disabled={loading}
        >
          <Sparkles size={16} color="#fbbf24" />
          <span>1-Click Demo Login</span>
        </button>
      </div>
    </div>
  );
}
