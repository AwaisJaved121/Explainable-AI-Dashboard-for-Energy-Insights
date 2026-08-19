import React, { useState, useEffect } from 'react';
import Card from './ui/Card';

const ModelPerformance = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/model/info')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch model info');
        return res.json();
      })
      .then(data => {
        setMetrics({
          heating: { r2: data.heating_r2 ?? null },
          cooling: { r2: data.cooling_r2 ?? null },
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
          <h2 className="card-title">Model Performance</h2>
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-8 bg-gray-800/50 rounded skeleton" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="card-header">
        <h2 className="card-title">Model Performance</h2>
        <p className="card-subtitle">Tuned Random Forest with GridSearchCV</p>
      </div>

      {error ? (
        <div className="bg-gray-800/50 p-6 rounded-lg text-center border border-red-500/30">
          <h4 className="text-sm font-medium text-red-400 mb-2">Backend Unavailable</h4>
          <p className="text-sm text-gray-400">
            Model metrics could not be loaded. Make sure the backend API is running, then refresh the page.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Heating Load</h4>
              <div>
                <p className="text-2xl font-bold text-orange-400">{metrics.heating.r2 !== null ? metrics.heating.r2.toFixed(4) : '—'}</p>
                <p className="text-xs text-gray-500">R² Score</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Cooling Load</h4>
              <div>
                <p className="text-2xl font-bold text-blue-400">{metrics.cooling.r2 !== null ? metrics.cooling.r2.toFixed(4) : '—'}</p>
                <p className="text-xs text-gray-500">R² Score</p>
              </div>
            </div>
          </div>

          <div className="mt-2 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500">
              R² scores are the values saved with the trained model artifacts. Baseline model comparisons,
              per-fold cross-validation plots and training-loss curves were not persisted in the artifacts and
              are therefore not displayed. See EVALUATION.md for the full technical evaluation.
            </p>
          </div>
        </>
      )}
    </Card>
  );
};

export default ModelPerformance;
