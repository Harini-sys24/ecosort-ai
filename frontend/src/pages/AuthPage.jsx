import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Shield, User, Mail, Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthPage = ({ setCurrentPage }) => {
  const { login, register, continueAsGuest } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(formData.email, formData.password);
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          if (user.role === 'admin') {
            setCurrentPage('admin');
          } else {
            setCurrentPage('identify');
          }
        }, 600);
      } else {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name.');
        }
        const user = await register(formData.name, formData.email, formData.password);
        setSuccessMsg(`Account created successfully! Welcome, ${user.name}.`);
        setTimeout(() => {
          setCurrentPage('identify');
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo autofill helpers for testing convenience
  const fillDemoAdmin = () => {
    setMode('login');
    setFormData({
      name: '',
      email: 'admin@ecosort.ai',
      password: 'Admin@123',
    });
    setError(null);
  };

  const fillDemoUser = () => {
    setMode('login');
    setFormData({
      name: '',
      email: 'user@ecosort.ai',
      password: 'User@123',
    });
    setError(null);
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    setCurrentPage('identify');
  };

  return (
    <div className="container" style={{ maxWidth: '520px', paddingTop: '20px' }}>
      <div className="glass-card" style={{
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(52, 211, 153, 0.25)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            {mode === 'login' ? <LogIn size={26} color="#34d399" /> : <UserPlus size={26} color="#38bdf8" />}
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>
            {mode === 'login' ? 'Sign In to EcoSort AI' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {mode === 'login' 
              ? 'Access your personal recycling history and administrative tools.' 
              : 'Join the circular electronic waste research platform.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(6, 23, 16, 0.8)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'login' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: mode === 'login' ? '#34d399' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
          >
            <LogIn size={15} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'register' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: mode === 'register' ? '#38bdf8' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
          >
            <UserPlus size={15} /> Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">
                <span>Full Name</span>
                <User size={14} color="#94a3b8" />
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Jane Goodall"
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
              <Mail size={14} color="#94a3b8" />
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. researcher@ecosort.ai"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password</span>
              <Lock size={14} color="#94a3b8" />
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px' }} />
                Authenticating...
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register Account
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Helpers */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center' }}>
            Quick Demo Credentials for Evaluation:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <Shield size={13} /> Fill Admin Demo
            </button>
            <button
              type="button"
              onClick={fillDemoUser}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <User size={13} /> Fill User Demo
            </button>
          </div>

          {/* Guest Access Option */}
          <button
            type="button"
            onClick={handleGuestEntry}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              border: '1px dashed rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              fontSize: '0.88rem'
            }}
          >
            <Sparkles size={16} /> Continue as Guest (Public Access)
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
