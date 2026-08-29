import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PredictionProvider } from './context/PredictionContext';
import Dashboard from './components/Dashboard';
import PredictionPanel from './components/PredictionPanel';
import ExplanationPanel from './components/ExplanationPanel';
import AnomalyDetection from './components/AnomalyDetection';
import CounterfactualAnalysis from './components/CounterfactualAnalysis';
import OptimizationPanel from './components/OptimizationPanel';
import QuestionTab from './components/QuestionTab';
import ModelPerformance from './components/ModelPerformance';
import PredictionAccuracy from './components/PredictionAccuracy';
import './App.css';

/* ─── KPI Strip (shown on overview page) ─── */
const KPIStrip = () => {
  const [stats, setStats] = useState({
    heatingR2: null,
    coolingR2: null,
    online: null,
  });

  useEffect(() => {
    fetch('/model/info')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setStats({
          heatingR2: data.heating_r2 ?? null,
          coolingR2: data.cooling_r2 ?? null,
          online: true,
        });
      })
      .catch(() => {
        setStats({ heatingR2: null, coolingR2: null, online: false });
      });
  }, []);

  const fmt = (v) => (v === null ? '—' : v.toFixed(3));

  return (
    <div className="grid grid-4 mb-6 animate-in">
      {[
        { label: 'Model Accuracy (R²)', value: fmt(stats.heatingR2), sub: 'Heating Load', color: '#f97316' },
        { label: 'Model Accuracy (R²)', value: fmt(stats.coolingR2), sub: 'Cooling Load', color: '#06b6d4' },
        { label: 'XAI Techniques', value: '3', sub: 'SHAP · LIME · Counterfactual', color: '#8b5cf6' },
        { label: 'System Status', value: stats.online === null ? '…' : stats.online ? 'Online' : 'Offline', sub: stats.online === false ? 'Backend unreachable' : 'All models operational', color: stats.online === false ? '#ef4444' : '#22c55e' },
      ].map((kpi, i) => (
        <div key={i} className="card animate-in" style={{ animationDelay: `${i * 80}ms`, padding: 20 }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: kpi.color, boxShadow: `0 0 8px ${kpi.color}60`
            }} />
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{kpi.label}</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 28 }}>{kpi.value}</div>
          <div className="text-xs mt-1" style={{ color: '#64748b' }}>{kpi.sub}</div>
        </div>
      ))}
    </div>
  );
};

/* ─── Page Components ─── */
const OverviewPage = () => (
  <div className="space-y-6 animate-in">
    <KPIStrip />
    <ModelPerformance />
    <PredictionAccuracy />
  </div>
);

const PredictionsPage = () => (
  <div className="animate-in">
    <PredictionPanel />
  </div>
);

const ExplanationsPage = () => (
  <div className="animate-in">
    <ExplanationPanel />
  </div>
);

const AnomalyPage = () => (
  <div className="animate-in">
    <AnomalyDetection />
  </div>
);

const CounterfactualPage = () => (
  <div className="animate-in">
    <CounterfactualAnalysis />
  </div>
);

const OptimizationPage = () => (
  <div className="animate-in">
    <OptimizationPanel />
  </div>
);

const QuestionPage = () => (
  <div className="animate-in">
    <QuestionTab />
  </div>
);

/* ─── App Root ─── */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PredictionProvider>
          <Routes>
            <Route path="/" element={<Dashboard />}>
              <Route index element={<OverviewPage />} />
              <Route path="predictions" element={<PredictionsPage />} />
              <Route path="explanations" element={<ExplanationsPage />} />
              <Route path="anomaly" element={<AnomalyPage />} />
              <Route path="counterfactual" element={<CounterfactualPage />} />
              <Route path="optimization" element={<OptimizationPage />} />
              <Route path="questionnaire" element={<QuestionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </PredictionProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;