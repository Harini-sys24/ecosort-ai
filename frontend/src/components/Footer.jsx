import React from 'react';
import { Leaf, Heart, Shield, ExternalLink, Globe } from 'lucide-react';

export const Footer = ({ setCurrentPage, setActiveTab }) => {
  const handleNav = (page, tab = null) => {
    setCurrentPage(page);
    if (tab && setActiveTab) setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      backgroundColor: '#04110c',
      borderTop: '1px solid rgba(52, 211, 153, 0.15)',
      padding: '56px 0 32px 0',
      color: 'var(--text-secondary)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Col 1: About the Research */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Leaf size={18} color="#04110c" strokeWidth={2.4} />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#ffffff'
              }}>
                EcoSort<span style={{ color: '#34d399' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px' }}>
              A CSE capstone research initiative on: <br />
              <strong style={{ color: '#f8fafc' }}>
                "The Environmental Cost of Our Digital Life: A Smart Approach to E-Waste Management Using Machine Learning"
              </strong>
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Addressing the 62M metric tonne global e-waste crisis through accessible deep learning, safe circular disassembly guidance, and certified disposal routing.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '18px', letterSpacing: '0.02em' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); handleNav('home'); }}>
                  Home & Overview
                </a>
              </li>
              <li>
                <a href="#identify" onClick={(e) => { e.preventDefault(); handleNav('identify'); }}>
                  AI Classifier Tool
                </a>
              </li>
              <li>
                <a href="#results" onClick={(e) => { e.preventDefault(); handleNav('results', 'results'); }}>
                  Results & Hub
                </a>
              </li>
              <li>
                <a href="#guide" onClick={(e) => { e.preventDefault(); handleNav('results', 'guide'); }}>
                  Safe Disposal Guides
                </a>
              </li>
              <li>
                <a href="#centres" onClick={(e) => { e.preventDefault(); handleNav('results', 'centres'); }}>
                  Certified Drop Centres
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & ML */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '18px', letterSpacing: '0.02em' }}>
              Technical System
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>
                <span style={{ color: '#94a3b8' }}>Model Architecture:</span> Deep CNN
              </li>
              <li>
                <span style={{ color: '#94a3b8' }}>Classes Supported:</span> 6 Categories
              </li>
              <li>
                <span style={{ color: '#94a3b8' }}>Inference Engine:</span> TensorFlow / Keras
              </li>
              <li>
                <span style={{ color: '#94a3b8' }}>Backend Services:</span> Python Flask REST
              </li>
              <li>
                <span style={{ color: '#94a3b8' }}>Persistence:</span> Relational SQLite
              </li>
            </ul>
          </div>

          {/* Col 4: Administrator & Research Credentials */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '18px', letterSpacing: '0.02em' }}>
              System Administration
            </h4>
            <p style={{ fontSize: '0.84rem', marginBottom: '14px' }}>
              Authorized administrators can audit model performance, confusion matrices, and update category guidelines.
            </p>
            <button
              onClick={() => handleNav('auth')}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              <Shield size={14} /> Admin Access Portal
            </button>
            <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#64748b' }}>
              * Demo collection locations are labeled for scientific evaluation.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 EcoSort AI. Department of Computer Science & Engineering. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="#34d399" /> Circular Economy AI Initiative
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={14} color="#f43f5e" /> Built for Sustainable Futures
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
