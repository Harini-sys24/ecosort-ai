import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Cpu, ShieldCheck, User, LogOut, LogIn, Sparkles, Navigation } from 'lucide-react';

export const Navbar = ({ currentPage, setCurrentPage, setActiveTab }) => {
  const { user, isAuthenticated, isAdmin, isGuest, logout } = useAuth();

  const handleNav = (page, tab = null) => {
    setCurrentPage(page);
    if (tab && setActiveTab) {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '76px',
      backgroundColor: 'rgba(6, 23, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(52, 211, 153, 0.15)',
      zIndex: 900,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo and Tagline */}
        <div 
          onClick={() => handleNav('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            position: 'relative'
          }}>
            <Leaf size={22} color="#061a12" strokeWidth={2.4} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#34d399',
              border: '2px solid #061a12'
            }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.28rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}>
                EcoSort<span style={{ color: '#34d399' }}>AI</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Research
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
              Identify. Understand. Recycle.
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleNav('home')}
            className={`btn-ghost btn-sm ${currentPage === 'home' ? 'active-nav' : ''}`}
            style={{
              fontWeight: 600,
              color: currentPage === 'home' ? '#34d399' : 'var(--text-secondary)',
              borderBottom: currentPage === 'home' ? '2px solid #34d399' : '2px solid transparent',
              borderRadius: 0,
              padding: '8px 12px'
            }}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('identify')}
            className={`btn-ghost btn-sm ${currentPage === 'identify' ? 'active-nav' : ''}`}
            style={{
              fontWeight: 600,
              color: currentPage === 'identify' ? '#34d399' : 'var(--text-secondary)',
              borderBottom: currentPage === 'identify' ? '2px solid #34d399' : '2px solid transparent',
              borderRadius: 0,
              padding: '8px 12px'
            }}
          >
            Identify E-Waste
          </button>

          <button
            onClick={() => handleNav('results', 'results')}
            className={`btn-ghost btn-sm ${currentPage === 'results' ? 'active-nav' : ''}`}
            style={{
              fontWeight: 600,
              color: currentPage === 'results' ? '#34d399' : 'var(--text-secondary)',
              borderBottom: currentPage === 'results' ? '2px solid #34d399' : '2px solid transparent',
              borderRadius: 0,
              padding: '8px 12px'
            }}
          >
            Results & Hub
          </button>

          <button
            onClick={() => handleNav('results', 'centres')}
            className="btn-ghost btn-sm"
            style={{ fontWeight: 600, padding: '8px 12px' }}
          >
            Collection Centres
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`btn-ghost btn-sm ${currentPage === 'admin' ? 'active-nav' : ''}`}
              style={{
                fontWeight: 600,
                color: currentPage === 'admin' ? '#38bdf8' : '#7dd3fc',
                borderBottom: currentPage === 'admin' ? '2px solid #38bdf8' : '2px solid transparent',
                borderRadius: 0,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={16} /> Admin Dashboard
            </button>
          )}
        </nav>

        {/* Auth / Action CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)'
              }}>
                <User size={15} color="#34d399" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  {user.name.split(' ')[0]}
                </span>
                {isAdmin && (
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
                title="Log Out"
                style={{ padding: '7px 12px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isGuest && (
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                  Guest Mode
                </span>
              )}
              <button
                onClick={() => handleNav('auth')}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={15} /> Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
