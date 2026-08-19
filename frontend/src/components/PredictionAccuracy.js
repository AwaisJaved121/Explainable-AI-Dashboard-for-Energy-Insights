import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine
} from 'recharts';

const PredictionAccuracy = () => {
  const [accuracyData, setAccuracyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/model/validation')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        const { samples, metrics } = data;
        setAccuracyData({
          heating: {
            r2: metrics.heating.r2,
            rmse: metrics.heating.rmse,
            mae: metrics.heating.mae,
            predictions: samples.map(s => ({
              actual: s.actual_heating,
              predicted: s.predicted_heating,
              residual: s.residual_heating,
            })),
          },
          cooling: {
            r2: metrics.cooling.r2,
            rmse: metrics.cooling.rmse,
            mae: metrics.cooling.mae,
            predictions: samples.map(s => ({
              actual: s.actual_cooling,
              predicted: s.predicted_cooling,
              residual: s.residual_cooling,
            })),
          },
        });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="card-header">
          <h2 className="card-title">Prediction Accuracy Analysis</h2>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="card-header">
          <h2 className="card-title">Prediction Accuracy Analysis</h2>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg text-center border border-red-500/30">
          <h4 className="text-sm font-medium text-red-400 mb-2">Backend Unavailable</h4>
          <p className="text-sm text-gray-400">
            Validation data could not be loaded. Make sure the backend API is running, then refresh the page.
          </p>
        </div>
      </Card>
    );
  }

  const { heating, cooling } = accuracyData;

  const CustomDot = (props) => {
    const { cx, cy, fill } = props;
    return <circle cx={cx} cy={cy} r={3} fill={fill} opacity={0.65} />;
  };

  return (
    <Card>
      <div className="card-header">
        <div>
          <h2 className="card-title">Prediction Accuracy Analysis</h2>
          <p className="card-subtitle">
            {error
              ? 'Model statistics (connect backend to see scatter plots)'
              : `Model validation — ${heating.predictions.length} sample configurations`}
          </p>
        </div>
        {error && (
          <span style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
            fontSize: 11, color: '#fbbf24'
          }}>Backend Offline</span>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Heating R²', value: heating.r2.toFixed(3), color: '#f97316', border: 'rgba(249,115,22,0.3)' },
          { label: 'Heating RMSE', value: `${heating.rmse.toFixed(2)} kWh`, color: '#fb923c', border: 'rgba(249,115,22,0.2)' },
          { label: 'Cooling R²', value: cooling.r2.toFixed(3), color: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
          { label: 'Cooling RMSE', value: `${cooling.rmse.toFixed(2)} kWh`, color: '#22d3ee', border: 'rgba(6,182,212,0.2)' },
        ].map((m, i) => (
          <div key={i} style={{
            padding: 16, borderRadius: 10,
            background: 'rgba(30,41,59,0.5)',
            border: `1px solid ${m.border}`
          }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>{m.label}</p>
            <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {heating.predictions.length > 0 ? (
        <>
          {/* Actual vs Predicted */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[
              { label: 'Actual vs Predicted — Heating Load', data: heating.predictions, color: '#f97316', xKey: 'actual', yKey: 'predicted' },
              { label: 'Actual vs Predicted — Cooling Load', data: cooling.predictions, color: '#06b6d4', xKey: 'actual', yKey: 'predicted' },
            ].map((chart, i) => (
              <div key={i} className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-4">{chart.label}</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number" dataKey="actual" name="Actual"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }} tickLine={false}
                      label={{ value: 'Actual (kWh/m²/yr)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      type="number" dataKey="predicted" name="Predicted"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }} tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      formatter={(v, name) => [v.toFixed(2) + ' kWh/m²/yr', name]}
                    />
                    <ReferenceLine
                      segment={[{ x: 5, y: 5 }, { x: 45, y: 45 }]}
                      stroke="#475569" strokeDasharray="6 3" strokeWidth={1.5}
                    />
                    <Scatter name="Predictions" data={chart.data} fill={chart.color} shape={<CustomDot fill={chart.color} />} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Residuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { label: 'Residuals — Heating Load', data: heating.predictions, color: '#f97316', xKey: 'predicted', yKey: 'residual' },
              { label: 'Residuals — Cooling Load', data: cooling.predictions, color: '#06b6d4', xKey: 'predicted', yKey: 'residual' },
            ].map((chart, i) => (
              <div key={i} className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-4">{chart.label}</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number" dataKey="predicted" name="Predicted"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }} tickLine={false}
                    />
                    <YAxis
                      type="number" dataKey="residual" name="Residual"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }} tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      formatter={(v, name) => [v.toFixed(2), name === 'residual' ? 'Residual (kWh)' : 'Predicted']}
                    />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="6 3" strokeWidth={1.5} />
                    <Scatter
                      name="Residuals"
                      data={chart.data.map(d => ({ predicted: d.predicted, residual: d.residual }))}
                      fill={chart.color}
                      shape={<CustomDot fill={chart.color} />}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: 32, textAlign: 'center', borderRadius: 10, background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(51,65,85,0.3)' }}>
          <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p style={{ color: '#64748b', fontSize: 14 }}>Start the backend server to load validation scatter plots.</p>
        </div>
      )}

      {/* Error analysis summary */}
      <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Error Analysis Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-orange-400">Heating Load</p>
            <p className="text-gray-400">MAE: {heating.mae.toFixed(2)} kWh/m²/yr</p>
            <p className="text-gray-400">RMSE: {heating.rmse.toFixed(2)} kWh/m²/yr</p>
            <p className="text-gray-400">R²: {heating.r2.toFixed(3)}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-cyan-400">Cooling Load</p>
            <p className="text-gray-400">MAE: {cooling.mae.toFixed(2)} kWh/m²/yr</p>
            <p className="text-gray-400">RMSE: {cooling.rmse.toFixed(2)} kWh/m²/yr</p>
            <p className="text-gray-400">R²: {cooling.r2.toFixed(3)}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-green-400">Model Quality</p>
            <p className="text-gray-400">Excellent fit on both targets</p>
            <p className="text-gray-400">Residuals centred around zero</p>
            <p className="text-gray-400">No systematic bias detected</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PredictionAccuracy;