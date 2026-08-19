import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

/* Map route paths to page titles */
const PAGE_TITLES = {
  '/': 'Overview',
  '/predictions': 'Prediction & Analysis',
  '/explanations': 'Model Explanations',
  '/anomaly': 'Anomaly Detection',
  '/counterfactual': 'Counterfactual Analysis',
  '/optimization': 'Design Optimization',
  '/questionnaire': 'Evaluation Questionnaire',
};

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="flex" style={{ height: '100vh', background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        <Header user={user} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
