import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { IdentifyPage } from './pages/IdentifyPage';
import { ResultsHubPage } from './pages/ResultsHubPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  const { user, isAdmin, loading } = useAuth();

  // Page routing state
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'auth', 'identify', 'results', 'admin'].includes(hash)) {
      return hash;
    }
    return 'home';
  });

  // Tab state within Results Hub
  const [activeResultsTab, setActiveResultsTab] = useState('results');

  // Classification result data passed from IdentifyPage to ResultsHubPage
  const [latestResult, setLatestResult] = useState(null);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state with window hash
  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'auth', 'identify', 'results', 'admin'].includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar with active states */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setActiveTab={setActiveResultsTab}
      />

      {/* Main Content Area */}
      <main className="page-wrapper">
        {currentPage === 'home' && (
          <HomePage
            setCurrentPage={setCurrentPage}
            setActiveTab={setActiveResultsTab}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'identify' && (
          <IdentifyPage
            setCurrentPage={setCurrentPage}
            setLatestResult={setLatestResult}
            setActiveTab={setActiveResultsTab}
          />
        )}

        {currentPage === 'results' && (
          <ResultsHubPage
            latestResult={latestResult}
            activeTab={activeResultsTab}
            setActiveTab={setActiveResultsTab}
            setCurrentPage={setCurrentPage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            onShowToast={showToast}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentPage={setCurrentPage}
        setActiveTab={setActiveResultsTab}
      />

      {/* Toast Notification Layer */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
