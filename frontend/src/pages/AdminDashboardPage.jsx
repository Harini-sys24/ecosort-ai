import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { 
  ShieldCheck, BarChart3, Database, Cpu, Users, Layers, MapPin, 
  Plus, Edit, Trash2, CheckCircle2, AlertTriangle, RefreshCw, 
  Clock, TrendingUp, Info
} from 'lucide-react';

export const AdminDashboardPage = ({ onShowToast, setCurrentPage }) => {
  const { user, isAdmin } = useAuth();
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'data', 'model'

  // Overview state
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Manage Data state
  const [categories, setCategories] = useState([]);
  const [centres, setCentres] = useState([]);
  const [dataSubTab, setDataSubTab] = useState('categories'); // 'categories', 'centres'

  // Model Performance state
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    hazard_level: 'Moderate',
    key_materials: '',
    recyclability_rate: 80,
    handling_instructions: '',
    environmental_risks: '',
    safety_protocols: '',
    recycling_advice: '',
    dos: '',
    donts: ''
  });

  const [isCentreModalOpen, setIsCentreModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [centreForm, setCentreForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    contact_phone: '',
    contact_email: '',
    operating_hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    accepted_items: '',
    is_demo: 1
  });

  // Load Overview Data
  const loadOverview = async () => {
    setOverviewLoading(true);
    try {
      const res = await api.getAdminOverview();
      setOverview(res);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error loading overview', 'error');
    } finally {
      setOverviewLoading(false);
    }
  };

  // Load Categories & Centres
  const loadDataManagement = async () => {
    try {
      const catRes = await api.getCategories();
      if (catRes?.categories) setCategories(catRes.categories);

      const centreRes = await api.getCentres();
      if (centreRes?.centres) setCentres(centreRes.centres);
    } catch (err) {
      console.error('Data load error:', err);
    }
  };

  // Load Model Metrics
  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await api.getModelMetrics();
      if (res?.metrics) setMetrics(res.metrics);
    } catch (err) {
      console.error('Metrics load error:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadOverview();
      loadDataManagement();
      loadMetrics();
    }
  }, [isAdmin]);

  // If not admin, block view
  if (!isAdmin) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '60px' }}>
        <div className="glass-card" style={{ padding: '48px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <ShieldCheck size={32} color="#fb7185" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '12px' }}>
            Protected Administrator Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            This portal is restricted to authorized research administrators. Please log in with administrator credentials (e.g. <code>admin@ecosort.ai</code>).
          </p>
          <button
            onClick={() => setCurrentPage('auth')}
            className="btn btn-primary"
          >
            Go to Admin Sign In
          </button>
        </div>
      </div>
    );
  }

  // Handle Category Modal Actions
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      hazard_level: 'Moderate',
      key_materials: '',
      recyclability_rate: 80,
      handling_instructions: 'Handle with care and isolate before recycling.',
      environmental_risks: 'Contains electronic materials that must not enter landfills.',
      safety_protocols: 'Wear gloves and do not tamper with electrical parts.',
      recycling_advice: 'Drop off at state-authorized e-waste collection points.',
      dos: 'Package safely; Hand to certified handlers',
      donts: 'Do not discard in household trash; Do not burn'
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      hazard_level: cat.hazard_level || 'Moderate',
      key_materials: cat.key_materials || '',
      recyclability_rate: cat.recyclability_rate || 80,
      handling_instructions: cat.handling_instructions || '',
      environmental_risks: cat.environmental_risks || '',
      safety_protocols: cat.safety_protocols || '',
      recycling_advice: cat.recycling_advice || '',
      dos: cat.dos || '',
      donts: cat.donts || ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        await api.updateGuidance(editingCategory.slug, categoryForm);
        if (onShowToast) onShowToast('Category and guidance updated successfully!', 'success');
      } else {
        await api.addCategory(categoryForm);
        if (onShowToast) onShowToast('New category added successfully!', 'success');
      }
      setIsCategoryModalOpen(false);
      loadDataManagement();
      loadOverview();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      if (onShowToast) onShowToast('Category removed successfully', 'info');
      loadDataManagement();
      loadOverview();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error deleting category', 'error');
    }
  };

  // Handle Centre Modal Actions
  const openAddCentre = () => {
    setEditingCentre(null);
    setCentreForm({
      name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      contact_phone: '',
      contact_email: '',
      operating_hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
      accepted_items: 'Smartphones, Laptops, PCBs, Batteries',
      is_demo: 1
    });
    setIsCentreModalOpen(true);
  };

  const openEditCentre = (c) => {
    setEditingCentre(c);
    setCentreForm({
      name: c.name || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      pin_code: c.pin_code || '',
      contact_phone: c.contact_phone || '',
      contact_email: c.contact_email || '',
      operating_hours: c.operating_hours || '',
      accepted_items: c.accepted_items || '',
      is_demo: c.is_demo !== undefined ? c.is_demo : 1
    });
    setIsCentreModalOpen(true);
  };

  const handleSaveCentre = async (e) => {
    e.preventDefault();
    try {
      if (editingCentre) {
        await api.updateCentre(editingCentre.id, centreForm);
        if (onShowToast) onShowToast('Collection centre updated successfully!', 'success');
      } else {
        await api.addCentre(centreForm);
        if (onShowToast) onShowToast('Collection centre created successfully!', 'success');
      }
      setIsCentreModalOpen(false);
      loadDataManagement();
      loadOverview();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving centre', 'error');
    }
  };

  const handleDeleteCentre = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection centre?')) return;
    try {
      await api.deleteCentre(id);
      if (onShowToast) onShowToast('Centre removed successfully', 'info');
      loadDataManagement();
      loadOverview();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error deleting centre', 'error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1160px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-cyan">Admin Console</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Logged in as: {user?.name}</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#ffffff', marginTop: '6px' }}>
            Administrator Dashboard
          </h1>
        </div>

        <button
          onClick={() => { loadOverview(); loadDataManagement(); loadMetrics(); }}
          className="btn btn-outline btn-sm"
        >
          <RefreshCw size={14} /> Refresh All Stats
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${adminTab === 'overview' ? 'active' : ''}`}
          onClick={() => setAdminTab('overview')}
          id="admin-tab-overview"
        >
          <BarChart3 size={18} /> 1. System Overview
        </button>

        <button
          className={`tab-btn ${adminTab === 'data' ? 'active' : ''}`}
          onClick={() => setAdminTab('data')}
          id="admin-tab-data"
        >
          <Database size={18} /> 2. Manage Data
        </button>

        <button
          className={`tab-btn ${adminTab === 'model' ? 'active' : ''}`}
          onClick={() => setAdminTab('model')}
          id="admin-tab-model"
        >
          <Cpu size={18} /> 3. Model Performance
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SYSTEM OVERVIEW
          ========================================================================= */}
      {adminTab === 'overview' && (
        <div>
          {overviewLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
              <span className="spinner spinner-lg" />
              <p style={{ marginTop: '16px' }}>Calculating platform metrics...</p>
            </div>
          ) : overview ? (
            <div>
              {/* Stat Cards */}
              <div className="grid-4" style={{ marginBottom: '32px' }}>
                <div className="glass-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Scans</span>
                    <BarChart3 size={20} color="#34d399" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {overview.stats.total_classifications}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px' }}>
                    Stored in SQLite database
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Registered Users</span>
                    <Users size={20} color="#38bdf8" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {overview.stats.total_users}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px' }}>
                    Hashed authentication
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Categories</span>
                    <Layers size={20} color="#fbbf24" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {overview.stats.total_categories}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '4px' }}>
                    Target classes
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Collection Centres</span>
                    <MapPin size={20} color="#a78bfa" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {overview.stats.total_centres}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#a78bfa', marginTop: '4px' }}>
                    Certified demo locations
                  </div>
                </div>
              </div>

              {/* Category Distribution Bars */}
              <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#ffffff' }}>
                  Classification Category Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {overview.category_distribution.map((cat) => {
                    const total = overview.stats.total_classifications || 1;
                    const percent = Math.round((cat.count / total) * 100);
                    return (
                      <div key={cat.slug}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{cat.count} scans ({percent}%)</span>
                        </div>
                        <div style={{
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.max(percent, 4)}%`,
                            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', color: '#ffffff' }}>
                  Recent Classification Activity
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px 14px' }}>Item Category</th>
                        <th style={{ padding: '12px 14px' }}>User / Account</th>
                        <th style={{ padding: '12px 14px' }}>Model Mode</th>
                        <th style={{ padding: '12px 14px' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recent_activity.map((act) => (
                        <tr key={act.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#ffffff' }}>
                            {act.category_name}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                            {act.user_name ? `${act.user_name} (${act.user_email})` : 'Anonymous Guest'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {act.is_demo_mode ? (
                              <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>Demo</span>
                            ) : (
                              <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Active CNN</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {new Date(act.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* =========================================================================
          TAB 2: MANAGE DATA (CATEGORIES & CENTRES CRUD)
          ========================================================================= */}
      {adminTab === 'data' && (
        <div>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn btn-sm ${dataSubTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDataSubTab('categories')}
              >
                <Layers size={16} /> Manage Categories ({categories.length})
              </button>
              <button
                className={`btn btn-sm ${dataSubTab === 'centres' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDataSubTab('centres')}
              >
                <MapPin size={16} /> Manage Collection Centres ({centres.length})
              </button>
            </div>

            {dataSubTab === 'categories' ? (
              <button onClick={openAddCategory} className="btn btn-cyan btn-sm">
                <Plus size={16} /> Add Category
              </button>
            ) : (
              <button onClick={openAddCentre} className="btn btn-cyan btn-sm">
                <Plus size={16} /> Add Collection Centre
              </button>
            )}
          </div>

          {/* Categories Table View */}
          {dataSubTab === 'categories' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>Name & Slug</th>
                      <th style={{ padding: '12px 14px' }}>Hazard Level</th>
                      <th style={{ padding: '12px 14px' }}>Recyclability</th>
                      <th style={{ padding: '12px 14px' }}>Key Materials</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <strong style={{ color: '#ffffff' }}>{cat.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>slug: {cat.slug}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${
                            cat.hazard_level === 'Severe' ? 'badge-rose' :
                            cat.hazard_level === 'High' ? 'badge-amber' : 'badge-emerald'
                          }`} style={{ fontSize: '0.75rem' }}>
                            {cat.hazard_level}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#34d399', fontWeight: 600 }}>
                          {cat.recyclability_rate}%
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {cat.key_materials}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '6px 10px' }}
                              title="Edit Category & Guidance"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px 10px', color: '#fb7185' }}
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Collection Centres Table View */}
          {dataSubTab === 'centres' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>Centre Name</th>
                      <th style={{ padding: '12px 14px' }}>Location / City</th>
                      <th style={{ padding: '12px 14px' }}>Contact Details</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centres.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <strong style={{ color: '#ffffff' }}>{c.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{c.operating_hours}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div>{c.address}</div>
                          <span style={{ color: '#38bdf8', fontSize: '0.82rem' }}>
                            {c.city}, {c.state} — {c.pin_code}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          <div>{c.contact_phone}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{c.contact_email}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                            Demo Data
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => openEditCentre(c)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '6px 10px' }}
                              title="Edit Centre"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCentre(c.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px 10px', color: '#fb7185' }}
                              title="Delete Centre"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: MODEL PERFORMANCE & METRICS
          ========================================================================= */}
      {adminTab === 'model' && (
        <div>
          {metricsLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
              <span className="spinner spinner-lg" />
              <p style={{ marginTop: '16px' }}>Fetching neural network benchmark metrics...</p>
            </div>
          ) : metrics ? (
            <div>
              {/* Architecture & Test Meta */}
              <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Measured Benchmark</span>
                    <h2 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                      {metrics.model_name}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                      Architecture: <strong style={{ color: '#34d399' }}>{metrics.architecture}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div>Test Samples: <strong style={{ color: '#ffffff' }}>{metrics.test_samples_count} items</strong></div>
                    <div>Avg Inference Latency: <strong style={{ color: '#38bdf8' }}>{metrics.avg_inference_time_ms} ms</strong></div>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="grid-4" style={{ gap: '16px' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ACCURACY</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                      {(metrics.accuracy * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PRECISION (MACRO)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                      {((metrics.precision_score || metrics.precision_macro) * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RECALL (MACRO)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                      {((metrics.recall_score || metrics.recall_macro) * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>F1-SCORE (MACRO)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>
                      {((metrics.f1_score || metrics.f1_macro) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Confusion Matrix Interactive Visualizer */}
              <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                    Measured Confusion Matrix (6x6 Grid)
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Rows: True Label | Columns: Predicted Label
                  </span>
                </div>

                {metrics.confusion_matrix && metrics.confusion_matrix.length > 0 ? (
                  <div style={{ overflowX: 'auto', padding: '10px 0' }}>
                    <div style={{ display: 'inline-block', minWidth: '550px' }}>
                      {/* Matrix Grid */}
                      <table style={{ borderCollapse: 'collapse', margin: '0 auto', textAlign: 'center' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>True \ Pred</th>
                            {['Phone', 'Laptop', 'Kbd', 'PCB', 'Battery', 'Cable'].map((h, i) => (
                              <th key={i} style={{ padding: '8px 14px', fontSize: '0.78rem', color: '#38bdf8' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.confusion_matrix.map((row, rIdx) => {
                            const labels = ['Phone', 'Laptop', 'Kbd', 'PCB', 'Battery', 'Cable'];
                            return (
                              <tr key={rIdx}>
                                <td style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, textAlign: 'right' }}>
                                  {labels[rIdx]}
                                </td>
                                {row.map((cell, cIdx) => {
                                  const isDiagonal = rIdx === cIdx;
                                  return (
                                    <td
                                      key={cIdx}
                                      style={{
                                        padding: '12px 16px',
                                        background: isDiagonal 
                                          ? 'rgba(16, 185, 129, 0.28)' 
                                          : cell > 0 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(52, 211, 153, 0.15)',
                                        color: isDiagonal ? '#34d399' : cell > 0 ? '#fb7185' : 'var(--text-dim)',
                                        fontWeight: isDiagonal ? 800 : 500,
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      {cell}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No confusion matrix data available.</p>
                )}
              </div>

              {/* Per-Class Metrics Table */}
              {metrics.per_class_metrics && (
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', color: '#ffffff' }}>
                    Per-Class Performance Report
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px 14px' }}>Target Class</th>
                          <th style={{ padding: '10px 14px' }}>Precision</th>
                          <th style={{ padding: '10px 14px' }}>Recall</th>
                          <th style={{ padding: '10px 14px' }}>F1-Score</th>
                          <th style={{ padding: '10px 14px' }}>Support Samples</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(metrics.per_class_metrics).map(([slug, data]) => (
                          <tr key={slug} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: '#ffffff' }}>
                              {data.name || slug.replace('_', ' ').toUpperCase()}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#38bdf8' }}>
                              {(data.precision * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px 14px', color: '#fbbf24' }}>
                              {(data.recall * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px 14px', color: '#34d399', fontWeight: 700 }}>
                              {((data.f1 || data.f1_score) * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                              {data.support} items
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No evaluation records found.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT CATEGORY & DISPOSAL GUIDANCE
          ========================================================================= */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New E-Waste Category'}
      >
        <form onSubmit={handleSaveCategory}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Tablets & Readers"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slug Identifier</label>
              <input
                type="text"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="e.g. tablets"
                className="form-input"
                disabled={!!editingCategory}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hazard Level</label>
              <select
                value={categoryForm.hazard_level}
                onChange={(e) => setCategoryForm({ ...categoryForm, hazard_level: e.target.value })}
                className="form-select"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recyclability Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={categoryForm.recyclability_rate}
                onChange={(e) => setCategoryForm({ ...categoryForm, recyclability_rate: parseInt(e.target.value) || 0 })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Key Materials</label>
            <input
              type="text"
              value={categoryForm.key_materials}
              onChange={(e) => setCategoryForm({ ...categoryForm, key_materials: e.target.value })}
              placeholder="e.g. Lithium, Aluminium, Glass, Cobalt"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Detailed description of component types..."
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Handling Instructions</label>
            <textarea
              value={categoryForm.handling_instructions}
              onChange={(e) => setCategoryForm({ ...categoryForm, handling_instructions: e.target.value })}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Environmental Risks</label>
            <textarea
              value={categoryForm.environmental_risks}
              onChange={(e) => setCategoryForm({ ...categoryForm, environmental_risks: e.target.value })}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Safety Protocols</label>
            <textarea
              value={categoryForm.safety_protocols}
              onChange={(e) => setCategoryForm({ ...categoryForm, safety_protocols: e.target.value })}
              className="form-textarea"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">DO's (Separate with semicolons)</label>
              <textarea
                value={categoryForm.dos}
                onChange={(e) => setCategoryForm({ ...categoryForm, dos: e.target.value })}
                placeholder="Reset data; Remove SIM; Deliver to depot"
                className="form-textarea"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">DON'Ts (Separate with semicolons)</label>
              <textarea
                value={categoryForm.donts}
                onChange={(e) => setCategoryForm({ ...categoryForm, donts: e.target.value })}
                placeholder="Do not toss in trash; Do not puncture battery"
                className="form-textarea"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Category Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL: ADD / EDIT COLLECTION CENTRE
          ========================================================================= */}
      <Modal
        isOpen={isCentreModalOpen}
        onClose={() => setIsCentreModalOpen(false)}
        title={editingCentre ? `Edit Collection Centre: ${editingCentre.name}` : 'Register New Collection Centre'}
      >
        <form onSubmit={handleSaveCentre}>
          <div className="form-group">
            <label className="form-label">Centre Name</label>
            <input
              type="text"
              value={centreForm.name}
              onChange={(e) => setCentreForm({ ...centreForm, name: e.target.value })}
              placeholder="e.g. EcoSort Green Circular Hub"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              value={centreForm.address}
              onChange={(e) => setCentreForm({ ...centreForm, address: e.target.value })}
              placeholder="e.g. Plot 15, Tech Park Phase 2"
              className="form-input"
              required
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={centreForm.city}
                onChange={(e) => setCentreForm({ ...centreForm, city: e.target.value })}
                placeholder="e.g. Bengaluru"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                value={centreForm.state}
                onChange={(e) => setCentreForm({ ...centreForm, state: e.target.value })}
                placeholder="e.g. Karnataka"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input
                type="text"
                value={centreForm.pin_code}
                onChange={(e) => setCentreForm({ ...centreForm, pin_code: e.target.value })}
                placeholder="e.g. 560100"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                value={centreForm.contact_phone}
                onChange={(e) => setCentreForm({ ...centreForm, contact_phone: e.target.value })}
                placeholder="e.g. +91 80 4123 9870"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                value={centreForm.contact_email}
                onChange={(e) => setCentreForm({ ...centreForm, contact_email: e.target.value })}
                placeholder="e.g. hub@ecosort.org"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Operating Hours</label>
            <input
              type="text"
              value={centreForm.operating_hours}
              onChange={(e) => setCentreForm({ ...centreForm, operating_hours: e.target.value })}
              placeholder="e.g. Mon - Sat: 9:00 AM - 6:00 PM"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Accepted Items (Comma-separated)</label>
            <input
              type="text"
              value={centreForm.accepted_items}
              onChange={(e) => setCentreForm({ ...centreForm, accepted_items: e.target.value })}
              placeholder="e.g. Smartphones, Laptops, PCBs, Batteries, Chargers"
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsCentreModalOpen(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Centre Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
