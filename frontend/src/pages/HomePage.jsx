import React from 'react';
import { 
  Camera, BookOpen, MapPin, Sparkles, ArrowRight, ShieldAlert, 
  Recycle, Cpu, Smartphone, BatteryCharging, Zap, CheckCircle2, TrendingUp, AlertTriangle
} from 'lucide-react';

export const HomePage = ({ setCurrentPage, setActiveTab }) => {
  const navigateTo = (page, tab = null) => {
    setCurrentPage(page);
    if (tab && setActiveTab) setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      {/* 1. HERO SECTION */}
      <section style={{
        padding: '50px 0 70px 0',
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.9fr',
        gap: '48px',
        alignItems: 'center'
      }}>
        <div>
          {/* Research Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '20px'
          }}>
            <Sparkles size={16} color="#34d399" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>
              CSE RESEARCH INITIATIVE • AI FOR CIRCULAR SUSTAINABILITY
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '22px',
            letterSpacing: '-0.03em'
          }}>
            The Environmental Cost of Our <span style={{
              background: 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline'
            }}>Digital Life</span>.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            marginBottom: '36px',
            maxWidth: '620px'
          }}>
            Millions of smartphones, laptops, and batteries end up in toxic open landfills every day. 
            <strong> EcoSort AI</strong> combines deep convolutional computer vision with circular disassembly protocols 
            to identify, understand, and safely redirect electronic scrap to certified e-waste recovery centers.
          </p>

          {/* Core Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '40px' }}>
            <button
              onClick={() => navigateTo('identify')}
              className="btn btn-primary btn-lg"
              id="hero-identify-btn"
            >
              <Camera size={20} />
              Identify E-Waste Now
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigateTo('results', 'guide')}
              className="btn btn-outline btn-lg"
              id="hero-guide-btn"
            >
              <BookOpen size={20} />
              Explore Disposal Guide
            </button>

            <button
              onClick={() => navigateTo('results', 'centres')}
              className="btn btn-cyan btn-lg"
              id="hero-centres-btn"
            >
              <MapPin size={20} />
              Find Collection Centres
            </button>
          </div>

          {/* Mini Trust Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '20px'
          }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>6 Classes</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target E-Waste Types</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>94.3%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Benchmark Model Acc.</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>Zero Toxin</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Landfill Diverted Goal</div>
            </div>
          </div>
        </div>

        {/* Hero Visual Card / Interactive Graphic */}
        <div style={{ position: 'relative' }}>
          <div className="glass-card" style={{
            background: 'linear-gradient(145deg, rgba(14, 43, 33, 0.85) 0%, rgba(6, 23, 16, 0.95) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.15)',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.05em' }}>
                  AI INFERENCE ENGINE ACTIVE
                </span>
              </div>
              <span className="badge badge-cyan">CNN Architecture</span>
            </div>

            {/* Simulated Classification Screen */}
            <div style={{
              background: 'rgba(4, 15, 10, 0.8)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(52, 211, 153, 0.35)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Cpu size={36} color="#34d399" />
              </div>
              <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '6px' }}>
                Multi-Class Image Segmentation
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Upload or capture PCBs, batteries, phones, and peripherals for real-time safety categorization.
              </p>
            </div>

            {/* Real-time Category Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { name: 'Smartphones', icon: Smartphone, color: '#34d399' },
                { name: 'Motherboards', icon: Cpu, color: '#38bdf8' },
                { name: 'Li-Ion Cells', icon: BatteryCharging, color: '#fb7185' },
                { name: 'Cables & Pins', icon: Zap, color: '#fbbf24' },
                { name: 'Keyboards', icon: Recycle, color: '#a78bfa' },
                { name: 'Laptops', icon: Sparkles, color: '#34d399' },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <IconComponent size={14} color={item.color} />
                    <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE FEATURE CARDS */}
      <section style={{ padding: '40px 0 60px 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px auto' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>
            System Modules
          </span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '14px' }}>
            Three Pillars of Intelligent E-Waste Recovery
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Transforming electronic scrap from a hazardous ecological threat into high-purity recycled secondary raw materials.
          </p>
        </div>

        <div className="grid-3">
          {/* Feature 1 */}
          <div className="glass-card glass-card-interactive" onClick={() => navigateTo('identify')}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Camera size={26} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>
              1. AI Identification
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Instant deep convolutional neural network classification directly from your device camera or uploaded image. 
              Supports automatic detection across 6 key consumer e-waste categories.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
              Try Scanner <ArrowRight size={16} />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-card glass-card-interactive" onClick={() => navigateTo('results', 'guide')}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <ShieldAlert size={26} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>
              2. Smart Disposal Guidance
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Prevent fires and chemical poisoning. Receive precise, laboratory-backed safety warnings, 
              battery isolation instructions, and chemical hazards associated with each component.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem' }}>
              View Safety Rules <ArrowRight size={16} />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-card glass-card-interactive" onClick={() => navigateTo('results', 'centres')}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Recycle size={26} color="#fbbf24" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>
              3. Responsible Recycling
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Locate verified government-authorized e-waste drop-off depositories and buyback hubs by City or PIN code. 
              Get direct addresses, operating hours, and accepted materials.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem' }}>
              Find Drop Depots <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. ENVIRONMENTAL AWARENESS & TOXICITY BREAKDOWN */}
      <section style={{
        background: 'rgba(10, 36, 27, 0.5)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(52, 211, 153, 0.15)',
        margin: '20px 0 50px 0',
        padding: '48px 36px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div>
            <span className="badge badge-rose" style={{ marginBottom: '14px' }}>
              Environmental Crisis Alert
            </span>
            <h2 style={{ fontSize: '2rem', marginBottom: '18px' }}>
              Why E-Waste Cannot Be Treated Like Ordinary Trash
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.65, marginBottom: '20px' }}>
              Electronics account for only <strong>2% of municipal waste solid volume</strong>, but they generate over 
              <strong> 70% of hazardous heavy metal toxic waste</strong> in municipal landfills. When exposed to rain and compaction:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={20} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff' }}>Lead & Mercury Leaching:</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> CRT screens, circuit solder, and mercury backlights poison local aquifers, causing permanent neurotoxicity.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff' }}>Lithium Thermal Runaway:</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> Compressed phone and laptop cells violently ignite in standard garbage trucks, releasing hydrofluoric gas.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff' }}>Dioxin Emission from Cable Burning:</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> Burning PVC wire jackets to reclaim copper generates carcinogenic chlorinated dioxins.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateTo('results', 'guide')}
              className="btn btn-primary"
            >
              Read Full Hazard & Safety Guide
            </button>
          </div>

          {/* Recovery Potential Card */}
          <div className="glass-card" style={{
            background: 'rgba(6, 23, 16, 0.85)',
            border: '1px solid rgba(52, 211, 153, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <TrendingUp size={22} color="#34d399" />
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                The Circular Opportunity
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              E-waste is also an urban goldmine. One tonne of discarded smartphones contains more gold than 
              <strong> 40 tonnes of raw mined gold ore</strong>!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { material: 'Gold & Silver in PCBs', recovery: '98%', status: 'Recoverable via clean hydrometallurgy' },
                { material: 'Copper from Chargers & Cords', recovery: '99.5%', status: 'Infinite circular recyclability' },
                { material: 'Lithium & Cobalt in Cells', recovery: '95%', status: 'Critical battery-grade mineral supply' },
                { material: 'ABS & Polycarbonate Casings', recovery: '85%', status: 'Clean regranulation into industrial parts' }
              ].map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{m.material}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.status}</div>
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#34d399',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {m.recovery}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION / GUEST OR LOGIN NAVIGATION */}
      <section style={{
        textAlign: 'center',
        padding: '50px 20px 40px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '14px' }}>
          Ready to Sort Your Discarded Electronics?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '30px' }}>
          You can identify e-waste instantly as a guest without creating an account, or log in to save and track your personal recycling history over time.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigateTo('identify')}
            className="btn btn-primary btn-lg"
          >
            <Camera size={20} /> Launch AI Scanner (Free & Public)
          </button>
          <button
            onClick={() => navigateTo('auth')}
            className="btn btn-outline btn-lg"
          >
            Sign Up / Log In to Save Scans
          </button>
        </div>
      </section>
    </div>
  );
};
