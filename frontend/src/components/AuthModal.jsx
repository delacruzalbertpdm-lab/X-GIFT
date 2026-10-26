import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { api, setAuthToken } from '../api';

export default function AuthModal({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignedNotice, setAssignedNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      if (mode === 'login') {
        const res = await api.login(formData.username, formData.password);
        setAuthToken(res.token);
        onLoginSuccess(res.user);
      } else {
        const res = await api.register({
          username: formData.username,
          password: formData.password,
          display_name: formData.display_name,
          email: formData.email,
        });
        setAuthToken(res.token);
        setAssignedNotice(res.user);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 2200);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card">
        {/* Left: Form Column */}
        <div className="auth-split-form-col">
          <div className="auth-header-block">
            <h1 className="auth-main-title">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Welcome back! Enter your credentials to access the exchange pool.'
                : "Let's get started with your exchange gift registration."}
            </p>
          </div>

          {/* Success Banner when registering */}
          {assignedNotice && (
            <div className="toast-banner toast-success" style={{ flexDirection: 'column', textAlign: 'center', padding: '16px' }}>
              <Sparkles size={24} style={{ color: 'var(--primary-emerald)' }} />
              <div style={{ fontWeight: '800', fontSize: '1.05rem', marginTop: '6px' }}>
                Welcome, {assignedNotice.display_name || assignedNotice.username}!
              </div>
              <div style={{ fontSize: '0.92rem', marginTop: '4px' }}>
                Your Lucky Number is <strong>#{assignedNotice.assigned_number}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-emerald-text)', marginTop: '4px', fontWeight: '600' }}>
                Redirecting to your dashboard...
              </div>
            </div>
          )}

          {error && (
            <div className="toast-banner toast-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-fields">
            {mode === 'register' && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="auth-clean-input"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="text"
                placeholder={mode === 'register' ? 'Username' : 'Username or Email'}
                className="auth-clean-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email (optional)"
                  className="auth-clean-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            )}

            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="auth-clean-input"
                style={{ paddingRight: '44px' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading || Boolean(assignedNotice)}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Processing...</span>
                </span>
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="auth-switch-prompt">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button type="button" className="auth-switch-btn" onClick={toggleMode}>
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" className="auth-switch-btn" onClick={toggleMode}>
                  Login
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right: Visual Picture Column - Clean white background with hamster image only */}
        <div className="auth-split-visual-col">
          <div className="auth-visual-inner">
            <div className="hamster-hero-frame">
              <img
                src="/hamster_hero.png"
                alt="LA Familia De Hamster CORPORATION"
                className="hamster-hero-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
