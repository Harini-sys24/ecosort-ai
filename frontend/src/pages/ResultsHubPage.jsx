import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Sparkles, ShieldCheck, MapPin, History, BookOpen, AlertTriangle, 
  CheckCircle2, XCircle, Search, ExternalLink, Trash2, BookmarkCheck,
  Phone, Mail, Clock, ArrowRight, RefreshCw, Cpu, Layers, Info
} from 'lucide-react';

export const ResultsHubPage = ({ 
  latestResult, 
  activeTab = 'results', 
  setActiveTab, 
  setCurrentPage,
  onShowToast 
}) => {
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    latestResult?.classification?.category_slug || 'mobile_phones'
  );
  const [selectedGuidance, setSelectedGuidance] = useState(null);

  // Collection centres state
  const [centres, setCentres] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchPin, setSearchPin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [centresLoading, setCentresLoading] = useState(false);

  // User history state
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Sync category if new latestResult arrives
  useEffect(() => {
    if (latestResult?.classification?.category_slug) {
      setSelectedCategorySlug(latestResult.classification.category_slug);
    }
  }, [latestResult]);

  // Load Categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.getCategories();
        if (res && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Load Guidance when selectedCategorySlug changes
  useEffect(() => {
    async function fetchGuidance() {
      if (!selectedCategorySlug) return;
      try {
        const res = await api.getGuidance(selectedCategorySlug);
        if (res && res.guidance) {
          setSelectedGuidance(res.guidance);
        }
      } catch (err) {
        console.error('Error loading guidance:', err);
      }
    }
    fetchGuidance();
  }, [selectedCategorySlug]);

  // Load Collection Centres
  const fetchCentres = async () => {
    setCentresLoading(true);
    try {
      const res = await api.getCentres({
        city: searchCity,
        pin: searchPin,
        q: searchQuery
      });
      if (res && res.centres) {
        setCentres(res.centres);
        if (res.available_cities) setAvailableCities(res.available_cities);
      }
    } catch (err) {
      console.error('Error fetching collection centres:', err);
    } finally {
      setCentresLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'centres') {
      fetchCentres();
    }
  }, [activeTab, searchCity]);

  // Load History when history tab active and user logged in
  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    setHistoryLoading(true);
    try {
      const res = await api.getUserHistory();
      if (res && res.history) {
        setUserHistory(res.history);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, isAuthenticated]);

  // Save current result to history manually
  const handleSaveResult = async () => {
    if (!isAuthenticated) {
      if (onShowToast) onShowToast('Please log in to save classifications to your history.', 'warning');
      setCurrentPage('auth');
      return;
    }

    if (!latestResult?.classification) return;

    try {
      const res = await api.saveToHistory({
        category_slug: latestResult.classification.category_slug,
        category_name: latestResult.classification.category_name,
        confidence: latestResult.classification.confidence,
        image_filename: latestResult.classification.image_filename,
        is_demo_mode: !latestResult.classification.is_trained ? 1 : 0,
        notes: 'Saved from Results Hub'
      });
      setSaveStatus('saved');
      if (onShowToast) onShowToast('Classification saved to your personal history!', 'success');
      fetchHistory();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to save record', 'error');
    }
  };

  // Delete history item
  const handleDeleteHistory = async (id) => {
    try {
      await api.deleteHistoryItem(id);
      setUserHistory(userHistory.filter(item => item.id !== id));
      if (onShowToast) onShowToast('Item removed from history.', 'info');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error deleting item', 'error');
    }
  };

  const classification = latestResult?.classification;
  const guidance = latestResult?.guidance || selectedGuidance;

  return (
    <div className="container" style={{ maxWidth: '1100px' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '10px' }}>
          Recycling & Intelligence Hub
        </span>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
          Results & Responsible Disposal Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
          Review neural classification predictions, explore laboratory safety protocols, 
          and locate certified e-waste recovery centers.
        </p>
      </div>

      {/* Modern Tab Bar */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          id="tab-results-btn"
        >
          <Sparkles size={18} /> 1. Scan Results
        </button>

        <button
          className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
          id="tab-guide-btn"
        >
          <BookOpen size={18} /> 2. Disposal Guide
        </button>

        <button
          className={`tab-btn ${activeTab === 'centres' ? 'active' : ''}`}
          onClick={() => setActiveTab('centres')}
          id="tab-centres-btn"
        >
          <MapPin size={18} /> 3. Collection Centres
        </button>

        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          id="tab-history-btn"
        >
          <History size={18} /> 4. My History
          {isAuthenticated && userHistory.length > 0 && (
            <span style={{
              background: '#34d399',
              color: '#061a12',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '4px'
            }}>
              {userHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CLASSIFICATION RESULTS
          ========================================================================= */}
      {activeTab === 'results' && (
        <div>
          {classification ? (
            <div className="grid-2" style={{ alignItems: 'start', marginBottom: '32px' }}>
              {/* Left Column: Image Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>Analyzed Electronic Item</h3>
                  {classification.is_trained ? (
                    <span className="badge badge-emerald">Trained CNN</span>
                  ) : (
                    <span className="badge badge-amber">Demo Mode</span>
                  )}
                </div>

                <div style={{
                  background: 'rgba(6, 23, 16, 0.95)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  marginBottom: '16px'
                }}>
                  {classification.image_url ? (
                    <img
                      src={classification.image_url}
                      alt="Uploaded item"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '320px',
                        objectFit: 'contain',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                  ) : (
                    <div style={{ padding: '60px 20px', color: 'var(--text-muted)' }}>
                      No image preview available
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Inference Latency: <strong style={{ color: '#ffffff' }}>{classification.inference_time_ms} ms</strong></span>
                  <span>Status: <strong style={{ color: '#34d399' }}>{classification.model_status}</strong></span>
                </div>
              </div>

              {/* Right Column: Classification Verdict Card */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>
                  Identification Verdict
                </span>

                <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#ffffff' }}>
                  {classification.category_name || 'E-Waste Item'}
                </h2>

                {/* Model Confidence Box */}
                <div style={{
                  background: 'rgba(6, 23, 16, 0.75)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Model Confidence:</span>
                    <span style={{
                      fontWeight: 800,
                      color: classification.is_trained ? '#34d399' : '#fbbf24',
                      fontSize: '1rem'
                    }}>
                      {classification.is_trained
                        ? `${Math.round(classification.confidence * 1000) / 10}%`
                        : 'Unmeasured (Demo Mode)'}
                    </span>
                  </div>

                  {classification.is_trained ? (
                    <div style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round(classification.confidence * 100)}%`,
                        background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#fbbf24', marginTop: '6px', lineHeight: 1.5 }}>
                      <Info size={14} style={{ display: 'inline', marginRight: '5px' }} />
                      No trained weights file loaded at <code>backend/ml/models/ecosort_cnn.keras</code>. Real confidence scores are only reported when a trained model evaluates input images.
                    </div>
                  )}
                </div>

                {/* Hazard Level Badge */}
                {guidance && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Hazard Screening:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${
                        guidance.hazard_level === 'Severe' ? 'badge-rose' :
                        guidance.hazard_level === 'High' ? 'badge-amber' : 'badge-emerald'
                      }`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        <AlertTriangle size={15} />
                        {guidance.hazard_level} Hazard Component
                      </span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Recyclability Rate: <strong style={{ color: '#34d399' }}>{guidance.recyclability_rate}%</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Action Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setSelectedCategorySlug(classification.category_slug);
                      setActiveTab('guide');
                    }}
                    className="btn btn-primary"
                    style={{ justifyContent: 'center' }}
                  >
                    <BookOpen size={18} /> View Safe Disposal Instructions
                  </button>

                  <button
                    onClick={() => setActiveTab('centres')}
                    className="btn btn-outline"
                    style={{ justifyContent: 'center' }}
                  >
                    <MapPin size={18} /> Locate Drop-off Centres
                  </button>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      onClick={handleSaveResult}
                      className="btn btn-ghost btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: saveStatus === 'saved' ? '#34d399' : 'var(--text-secondary)'
                      }}
                    >
                      <BookmarkCheck size={16} />
                      {saveStatus === 'saved' ? 'Saved to History' : 'Save to History'}
                    </button>

                    <button
                      onClick={() => setCurrentPage('identify')}
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <RefreshCw size={14} /> Scan Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <Sparkles size={32} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
                No Active Classification Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto' }}>
                Upload or capture an e-waste photo in the scanner, or explore the Disposal Guide and Collection Centres below.
              </p>
              <button
                onClick={() => setCurrentPage('identify')}
                className="btn btn-primary"
              >
                Go to Identify Scanner
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: DISPOSAL GUIDE
          ========================================================================= */}
      {activeTab === 'guide' && (
        <div>
          {/* Category Selector Pills */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`btn btn-sm ${selectedCategorySlug === cat.slug ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  border: selectedCategorySlug === cat.slug ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {selectedGuidance ? (
            <div className="glass-card" style={{ padding: '36px' }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
                borderBottom: '1px solid rgba(52, 211, 153, 0.2)',
                paddingBottom: '20px'
              }}>
                <div>
                  <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
                    Safe Protocol Guide
                  </span>
                  <h2 style={{ fontSize: '2rem', color: '#ffffff', margin: 0 }}>
                    {selectedGuidance.category_name || selectedCategorySlug.replace('_', ' ').toUpperCase()}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <span className={`badge ${
                    selectedGuidance.hazard_level === 'Severe' ? 'badge-rose' :
                    selectedGuidance.hazard_level === 'High' ? 'badge-amber' : 'badge-emerald'
                  }`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Hazard: {selectedGuidance.hazard_level}
                  </span>
                  <span className="badge badge-cyan" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Recyclability: {selectedGuidance.recyclability_rate}%
                  </span>
                </div>
              </div>

              {/* Grid of Key Guidance Areas */}
              <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
                {/* 1. Handling Instructions */}
                <div style={{
                  background: 'rgba(6, 23, 16, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px',
                  border: '1px solid rgba(52, 211, 153, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <BookOpen size={20} color="#34d399" />
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Safe Handling & Preparation</h3>
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {selectedGuidance.handling_instructions}
                  </p>
                </div>

                {/* 2. Environmental Risks */}
                <div style={{
                  background: 'rgba(6, 23, 16, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <AlertTriangle size={20} color="#fb7185" />
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Environmental & Toxic Risks</h3>
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {selectedGuidance.environmental_risks}
                  </p>
                </div>

                {/* 3. Safety Protocols */}
                <div style={{
                  background: 'rgba(6, 23, 16, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <ShieldCheck size={20} color="#fbbf24" />
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Mandatory Safety Protocols</h3>
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {selectedGuidance.safety_protocols}
                  </p>
                </div>

                {/* 4. Responsible Recycling Advice */}
                <div style={{
                  background: 'rgba(6, 23, 16, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px',
                  border: '1px solid rgba(6, 182, 212, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Layers size={20} color="#38bdf8" />
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Circular Metallurgy Advice</h3>
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {selectedGuidance.recycling_advice}
                  </p>
                </div>
              </div>

              {/* Do's and Don'ts Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '28px'
              }}>
                {/* Do's */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px'
                }}>
                  <h4 style={{ color: '#34d399', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} /> Best Practices (DO's)
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedGuidance.dos_list || selectedGuidance.dos.split(';')).map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                        <span style={{ color: '#34d399', fontWeight: 'bold' }}>✓</span>
                        <span>{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px'
                }}>
                  <h4 style={{ color: '#fb7185', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Hazardous Actions (DON'Ts)
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedGuidance.donts_list || selectedGuidance.donts.split(';')).map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                        <span style={{ color: '#fb7185', fontWeight: 'bold' }}>✕</span>
                        <span>{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <span className="spinner" />
              <p style={{ marginTop: '12px' }}>Loading category guidance...</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: COLLECTION CENTRES
          ========================================================================= */}
      {activeTab === 'centres' && (
        <div>
          {/* Demo Data Notice */}
          <div className="alert alert-info" style={{ marginBottom: '24px' }}>
            <Info size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Verified Demo Records:</strong> Collection centre listings are certified mock/demo data for this research evaluation. 
              Search by City or PIN code to view location details and directions.
            </div>
          </div>

          {/* Search Controls */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: '14px',
              alignItems: 'end'
            }}>
              <div>
                <label className="form-label">Search by Name or Keyword</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. EcoGreen, battery, cables..."
                    className="form-input"
                    onKeyDown={(e) => e.key === 'Enter' && fetchCentres()}
                  />
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '15px' }} />
                </div>
              </div>

              <div>
                <label className="form-label">Filter by City</label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  value={searchPin}
                  onChange={(e) => setSearchPin(e.target.value)}
                  placeholder="e.g. 560100"
                  className="form-input"
                  onKeyDown={(e) => e.key === 'Enter' && fetchCentres()}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={fetchCentres}
                  className="btn btn-primary"
                  style={{ height: '48px', padding: '0 24px' }}
                >
                  <Search size={18} /> Search
                </button>
              </div>
            </div>
          </div>

          {/* Centres Grid */}
          {centresLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
              <span className="spinner spinner-lg" />
              <p style={{ marginTop: '16px' }}>Searching authorized collection points...</p>
            </div>
          ) : centres.length > 0 ? (
            <div className="grid-2">
              {centres.map((c) => (
                <div key={c.id} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>
                      {c.name}
                    </h3>
                    <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                      Demo Centre
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      {c.address}, <strong>{c.city}</strong>, {c.state} — <strong>{c.pin_code}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Clock size={15} color="#38bdf8" />
                    <span>{c.operating_hours}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Phone size={15} color="#fbbf24" />
                    <span>{c.contact_phone}</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <Mail size={15} color="#fbbf24" />
                    <span>{c.contact_email}</span>
                  </div>

                  {/* Accepted items tags */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Accepted Items:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {c.accepted_items.split(',').map((item, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(52, 211, 153, 0.1)',
                          border: '1px solid rgba(52, 211, 153, 0.25)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: '#e2e8f0'
                        }}>
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Directions link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name} ${c.address} ${c.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                  >
                    <ExternalLink size={14} /> Get Directions on Maps
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                No collection centres found matching your query. Try resetting the city filter or searching another PIN code.
              </p>
              <button
                onClick={() => { setSearchCity(''); setSearchPin(''); setSearchQuery(''); fetchCentres(); }}
                className="btn btn-outline btn-sm"
                style={{ marginTop: '14px' }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: MY HISTORY
          ========================================================================= */}
      {activeTab === 'history' && (
        <div>
          {!isAuthenticated ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <History size={32} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
                Guest Mode Active
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
                You can classify e-waste freely without an account, but your past scans are not stored in the database. 
                Log in or sign up to maintain a persistent audit ledger of your disposed electronic items.
              </p>
              <button
                onClick={() => setCurrentPage('auth')}
                className="btn btn-primary btn-lg"
              >
                Sign In to Enable History
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
                    Your Saved E-Waste Classifications
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    All items scanned and logged under {user.name} ({user.email})
                  </p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="btn btn-ghost btn-sm"
                >
                  <RefreshCw size={14} /> Refresh Ledger
                </button>
              </div>

              {historyLoading ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <span className="spinner" />
                  <p style={{ marginTop: '12px' }}>Loading history ledger...</p>
                </div>
              ) : userHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {userHistory.map((h) => (
                    <div
                      key={h.id}
                      className="glass-card"
                      style={{
                        padding: '18px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        {h.image_url ? (
                          <img
                            src={h.image_url}
                            alt="Scan thumbnail"
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                              border: '1px solid rgba(52, 211, 153, 0.3)'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Cpu size={24} color="#34d399" />
                          </div>
                        )}

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                              {h.category_name}
                            </strong>
                            {h.is_demo_mode ? (
                              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Demo</span>
                            ) : (
                              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>CNN Trained</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Logged on: {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          <div style={{ color: 'var(--text-muted)' }}>Confidence:</div>
                          <strong style={{ color: h.confidence ? '#34d399' : '#fbbf24' }}>
                            {h.confidence ? `${Math.round(h.confidence * 1000) / 10}%` : 'Unmeasured (Demo)'}
                          </strong>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCategorySlug(h.category_slug);
                            setActiveTab('guide');
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          <BookOpen size={14} /> View Guide
                        </button>

                        <button
                          onClick={() => handleDeleteHistory(h.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#fb7185' }}
                          title="Delete history item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    You have not saved any classification records yet.
                  </p>
                  <button
                    onClick={() => setCurrentPage('identify')}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    Scan Your First Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
