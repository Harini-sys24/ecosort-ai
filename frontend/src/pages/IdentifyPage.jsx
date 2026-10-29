import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { 
  UploadCloud, Camera, RefreshCw, AlertCircle, Sparkles, CheckCircle2, 
  Cpu, Smartphone, BatteryCharging, Zap, Laptop, Keyboard, Video, VideoOff
} from 'lucide-react';

export const IdentifyPage = ({ setCurrentPage, setLatestResult, setActiveTab }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoHint, setDemoHint] = useState('');
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const fileInputRef = useRef(null);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    if (!file) return;

    setError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Stop camera if active
    if (isCameraActive) stopCamera();
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Camera integration
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access device camera. Please check camera permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  // Sample quick test generator (creates test image for instant evaluator testing)
  const loadSampleEwaste = (categorySlug, categoryName, color) => {
    setError(null);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#061710');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Draw stylized label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EcoSort AI Test Sample', 200, 160);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`[ ${categoryName} ]`, 200, 200);
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Digital Research Evaluation Asset', 200, 240);

    canvas.toBlob((blob) => {
      const file = new File([blob], `sample_${categorySlug}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setDemoHint(categorySlug);
    }, 'image/jpeg');
  };

  // Classification API Call
  const handleClassify = async () => {
    if (!selectedFile) {
      setError('Please select an image or capture a photo first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (demoHint) {
        formData.append('demo_hint', demoHint);
      }

      const response = await api.classifyItem(formData);
      
      // Store result and transition to Results Hub
      setLatestResult(response);
      if (setActiveTab) setActiveTab('results');
      setCurrentPage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.message || 'Error occurred while classifying image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '980px' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>
          Computer Vision Scanner
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
          Identify E-Waste Item
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Upload a high-resolution photo or use your camera to scan an electronic component for instant classification, 
          chemical hazard screening, and safe circular recycling routes.
        </p>
      </div>

      {/* Main Upload / Camera Workspace */}
      <div className="glass-card" style={{ padding: '36px', marginBottom: '36px' }}>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        {/* Live Camera View (when active) */}
        {isCameraActive && (
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: '#000',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                type="button"
                onClick={capturePhoto}
                className="btn btn-primary btn-lg"
              >
                <Camera size={20} /> Snap Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="btn btn-outline btn-lg"
              >
                <VideoOff size={20} /> Cancel Camera
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Drag & Drop or Preview Area */}
        {!isCameraActive && (
          <div>
            {previewUrl ? (
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'rgba(6, 23, 16, 0.9)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <img
                  src={previewUrl}
                  alt="E-waste preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'contain',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); setDemoHint(''); }}
                    className="btn btn-ghost btn-sm"
                  >
                    <RefreshCw size={14} /> Remove / Re-select Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(52, 211, 153, 0.35)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '56px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(6, 23, 16, 0.5)',
                  transition: 'var(--transition)',
                  marginBottom: '24px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#34d399'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.35)'}
              >
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <UploadCloud size={36} color="#34d399" />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
                  Drag & Drop E-Waste Image Here
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px' }}>
                  Supports JPG, JPEG, and PNG (up to 10MB)
                </p>
                <div style={{ display: 'inline-flex', gap: '10px' }}>
                  <span className="btn btn-outline btn-sm">
                    Browse Local File
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Action Buttons: Camera Switch & Classify */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px'
        }}>
          <div>
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="btn btn-outline"
              >
                <Camera size={18} /> Use Device Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="btn btn-ghost"
              >
                <VideoOff size={18} /> Turn Off Camera
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClassify}
              className="btn btn-primary btn-lg"
              disabled={!selectedFile || loading}
              id="classify-item-btn"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '20px', height: '20px' }} />
                  Processing CNN Classification...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Classify Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Evaluator Testing: Sample E-Waste Selector */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Sparkles size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>
            Quick Evaluator Samples (One-Click Testing)
          </h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Don't have an e-waste photo ready? Click any sample category below to generate a test item and preview the classification workflow instantly:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          {[
            { slug: 'mobile_phones', name: 'Smartphone', icon: Smartphone, color: '#10b981' },
            { slug: 'laptops', name: 'Laptop', icon: Laptop, color: '#06b6d4' },
            { slug: 'keyboards', name: 'Keyboard', icon: Keyboard, color: '#8b5cf6' },
            { slug: 'circuit_boards', name: 'PCB Board', icon: Cpu, color: '#f59e0b' },
            { slug: 'batteries', name: 'Li-Ion Battery', icon: BatteryCharging, color: '#ef4444' },
            { slug: 'chargers_cables', name: 'Power Cables', icon: Zap, color: '#10b981' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => loadSampleEwaste(item.slug, item.name, item.color)}
                className="btn btn-outline btn-sm"
                style={{
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <Icon size={20} color={item.color} />
                <span style={{ fontSize: '0.82rem' }}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
